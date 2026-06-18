import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function CreatePost({ onPostCreated }) {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && !image) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('text', text);
    if (image) formData.append('image', image);
    try {
      const { data } = await API.post('/posts', formData);
      onPostCreated(data);
      setText('');
      setImage(null);
      setPreview('');
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="create-post card">
      <div className="create-post-top">
        <img src={user?.avatar ? `http://localhost:5000${user.avatar}` : 'https://via.placeholder.com/40'} alt="" className="avatar" />
        <form onSubmit={handleSubmit} className="create-post-form">
          <textarea placeholder={`What's on your mind, ${user?.firstName}?`}
            value={text} onChange={(e) => setText(e.target.value)}
            rows={2} maxLength={5000} />
          {preview && (
            <div className="image-preview">
              <img src={preview} alt="" />
              <button type="button" className="remove-preview" onClick={() => { setImage(null); setPreview(''); }}>x</button>
            </div>
          )}
          <div className="create-post-actions">
            <label className="photo-btn">
              <svg viewBox="0 0 24 24" width="24" height="24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" fill="currentColor"/></svg>
              <input type="file" accept="image/*" onChange={handleImage} hidden />
            </label>
            <button type="submit" className="btn-post" disabled={loading || (!text.trim() && !image)}>
              {loading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
