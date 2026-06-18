import { useState, useEffect, useCallback } from 'react';
import API from '../api/axios';
import Sidebar from '../components/Sidebar';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import FriendSuggestions from '../components/FriendSuggestions';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchPosts = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const { data } = await API.get(`/posts?page=${page}`);
      if (data.length < 10) setHasMore(false);
      setPosts((prev) => [...prev, ...data]);
    } catch (err) {}
    setLoading(false);
  }, [page, loading, hasMore]);

  useEffect(() => { fetchPosts(); }, [page]);

  const handlePostCreated = (post) => setPosts((prev) => [post, ...prev]);

  const handleDelete = (id) => setPosts((prev) => prev.filter((p) => p._id !== id));

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 && hasMore && !loading) {
        setPage((p) => p + 1);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loading]);

  return (
    <div className="home-layout">
      <Sidebar />
      <main className="feed">
        <CreatePost onPostCreated={handlePostCreated} />
        {posts.map((post) => (
          <PostCard key={post._id} post={post} onDelete={handleDelete} />
        ))}
        {loading && <div className="loader">Loading...</div>}
      </main>
      <aside className="right-sidebar">
        <FriendSuggestions />
      </aside>
    </div>
  );
}
