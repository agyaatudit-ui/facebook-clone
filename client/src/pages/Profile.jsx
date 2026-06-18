import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import PostCard from '../components/PostCard';

export default function Profile() {
  const { id } = useParams();
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [friendStatus, setFriendStatus] = useState('none');
  const [showEdit, setShowEdit] = useState(false);
  const [bio, setBio] = useState('');
  const [hometown, setHometown] = useState('');
  const isOwner = user?._id === id;

  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await API.get(`/users/${id}`);
      setProfile(data);
      setBio(data.bio || '');
      setHometown(data.hometown || '');
      const friendIds = data.friends?.map((f) => f._id || f) || [];
      if (friendIds.includes(user?._id)) {
        setFriendStatus('friends');
      } else if (data.friendRequests?.some((r) => r.from === user?._id || r.from?.toString() === user?._id)) {
        setFriendStatus('requested');
      } else if (user?.friendRequests?.some((r) => r.from === id || r.from?.toString() === id)) {
        setFriendStatus('pending');
      } else {
        setFriendStatus('none');
      }
    } catch (err) {}
  }, [id, user]);

  const fetchPosts = useCallback(async () => {
    try {
      const { data } = await API.get(`/posts/user/${id}`);
      setPosts(data);
    } catch (err) {}
  }, [id]);

  useEffect(() => { fetchProfile(); fetchPosts(); }, [fetchProfile, fetchPosts]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('avatar', file);
    const { data } = await API.post('/users/avatar', fd);
    updateUser({ avatar: data.avatar });
    setProfile((prev) => ({ ...prev, avatar: data.avatar }));
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('cover', file);
    const { data } = await API.post('/users/cover', fd);
    updateUser({ coverPhoto: data.coverPhoto });
    setProfile((prev) => ({ ...prev, coverPhoto: data.coverPhoto }));
  };

  const handleSaveProfile = async () => {
    await API.put('/users/profile', { bio, hometown });
    setShowEdit(false);
    setProfile((prev) => ({ ...prev, bio, hometown }));
  };

  const handleFriendAction = async () => {
    if (friendStatus === 'none') {
      await API.post(`/users/friend-request/${id}`);
      setFriendStatus('requested');
    } else if (friendStatus === 'pending') {
      await API.post(`/users/friend-request/${id}/accept`);
      setFriendStatus('friends');
      fetchProfile();
    } else if (friendStatus === 'requested') {
      await API.post(`/users/friend-request/${id}/decline`);
      setFriendStatus('none');
    } else if (friendStatus === 'friends') {
      await API.post(`/users/unfriend/${id}`);
      setFriendStatus('none');
    }
  };

  if (!profile) return <div className="loader">Loading...</div>;

  return (
    <div className="profile-page">
      <div className="profile-cover">
        <img src={profile.coverPhoto ? `http://localhost:5000${profile.coverPhoto}` : 'https://via.placeholder.com/1200x350/1877f2/ffffff?text=Cover'} alt="" />
        {isOwner && <label className="cover-upload"><input type="file" accept="image/*" onChange={handleCoverUpload} hidden />Change Cover</label>}
      </div>
      <div className="profile-info">
        <div className="profile-avatar-section">
          <div className="profile-avatar-wrap">
            <img src={profile.avatar ? `http://localhost:5000${profile.avatar}` : 'https://via.placeholder.com/168'} alt="" className="profile-avatar" />
            {isOwner && <label className="avatar-upload"><input type="file" accept="image/*" onChange={handleAvatarUpload} hidden /></label>}
          </div>
          <div className="profile-details">
            <h1>{profile.firstName} {profile.lastName}</h1>
            <span className="friend-count">{profile.friends?.length || 0} friends</span>
          </div>
          {!isOwner && (
            <button className={`btn-friend ${friendStatus}`} onClick={handleFriendAction}>
              {friendStatus === 'none' && 'Add Friend'}
              {friendStatus === 'pending' && 'Accept Request'}
              {friendStatus === 'requested' && 'Requested'}
              {friendStatus === 'friends' && 'Friends'}
            </button>
          )}
        </div>
        <div className="profile-bio">
          {isOwner && <button className="btn-edit" onClick={() => setShowEdit(!showEdit)}>Edit Bio</button>}
          {showEdit ? (
            <div className="edit-bio">
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Bio" maxLength={200} />
              <input value={hometown} onChange={(e) => setHometown(e.target.value)} placeholder="Hometown" />
              <button onClick={handleSaveProfile} className="btn-primary">Save</button>
            </div>
          ) : (
            <>
              {profile.bio && <p>{profile.bio}</p>}
              {profile.hometown && <p>From {profile.hometown}</p>}
            </>
          )}
        </div>
        <div className="profile-friends">
          <h3>Friends</h3>
          <div className="friends-grid">
            {profile.friends?.slice(0, 9).map((f) => (
              <Link key={f._id} to={`/profile/${f._id}`} className="friend-card">
                <img src={f.avatar ? `http://localhost:5000${f.avatar}` : 'https://via.placeholder.com/100'} alt="" />
                <span>{f.firstName} {f.lastName}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="profile-posts">
        {posts.length === 0 && <div className="card" style={{padding: 24, textAlign: 'center'}}>No posts yet</div>}
        {posts.map((post) => (
          <PostCard key={post._id} post={post} onDelete={(id) => setPosts((prev) => prev.filter((p) => p._id !== id))} />
        ))}
      </div>
    </div>
  );
}
