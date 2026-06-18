import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function PostCard({ post, onDelete }) {
  const { user } = useAuth();
  const [likes, setLikes] = useState(post.likes);
  const [comments, setComments] = useState(post.comments || []);
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const liked = likes.includes(user?._id);

  const handleLike = async () => {
    const { data } = await API.post(`/posts/${post._id}/like`);
    setLikes(data.likes);
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const { data } = await API.post(`/posts/${post._id}/comment`, { text: commentText });
    setComments(data);
    setCommentText('');
  };

  const handleDelete = async () => {
    await API.delete(`/posts/${post._id}`);
    onDelete(post._id);
  };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="post-card card">
      <div className="post-header">
        <Link to={`/profile/${post.user?._id}`} className="post-user">
          <img src={post.user?.avatar ? `https://facebook-clone-api-52k8.onrender.com${post.user.avatar}` : 'https://via.placeholder.com/40'} alt="" className="avatar" />
          <div>
            <strong>{post.user?.firstName} {post.user?.lastName}</strong>
            <span className="post-time">{timeAgo(post.createdAt)}</span>
          </div>
        </Link>
        {post.user?._id === user?._id && (
          <div className="post-menu-wrapper">
            <button className="post-menu-btn" onClick={() => setShowMenu(!showMenu)}>...</button>
            {showMenu && <div className="post-menu"><button onClick={handleDelete}>Delete Post</button></div>}
          </div>
        )}
      </div>
      {post.text && <div className="post-text">{post.text}</div>}
      {post.image && <img src={`https://facebook-clone-api-52k8.onrender.com${post.image}`} alt="" className="post-image" />}
      <div className="post-stats">
        {likes.length > 0 && <span>{likes.length} Likes</span>}
        {comments.length > 0 && <span onClick={() => setShowComments(!showComments)}>{comments.length} Comments</span>}
      </div>
      <div className="post-actions">
        <button className={`post-action ${liked ? 'liked' : ''}`} onClick={handleLike}>
          <svg viewBox="0 0 24 24" width="20" height="20"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3v11z" fill="currentColor"/></svg>
          Like
        </button>
        <button className="post-action" onClick={() => setShowComments(!showComments)}>
          <svg viewBox="0 0 24 24" width="20" height="20"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" fill="currentColor"/></svg>
          Comment
        </button>
      </div>
      {showComments && (
        <div className="comments-section">
          {comments.map((c) => (
            <div key={c._id} className="comment">
              <img src={c.user?.avatar ? `https://facebook-clone-api-52k8.onrender.com${c.user.avatar}` : 'https://via.placeholder.com/32'} alt="" />
              <div className="comment-body">
                <strong>{c.user?.firstName} {c.user?.lastName}</strong>
                <p>{c.text}</p>
              </div>
            </div>
          ))}
          <form className="comment-form" onSubmit={handleComment}>
            <input type="text" placeholder="Write a comment..." value={commentText}
              onChange={(e) => setCommentText(e.target.value)} />
            <button type="submit">Post</button>
          </form>
        </div>
      )}
    </div>
  );
}
