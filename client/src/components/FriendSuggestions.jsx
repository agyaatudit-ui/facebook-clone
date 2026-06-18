import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';

export default function FriendSuggestions() {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    API.get('/users/suggestions').then(({ data }) => setSuggestions(data)).catch(() => {});
  }, []);

  const sendRequest = async (id) => {
    try {
      await API.post(`/users/friend-request/${id}`);
      setSuggestions((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {}
  };

  if (suggestions.length === 0) return null;

  return (
    <div className="sidebar-section">
      <h4>Friend Suggestions</h4>
      {suggestions.map((u) => (
        <div key={u._id} className="suggestion-item">
          <Link to={`/profile/${u._id}`} className="suggestion-user">
            <img src={u.avatar ? `https://facebook-clone-api-52k8.onrender.com${u.avatar}` : 'https://via.placeholder.com/36'} alt="" />
            <span>{u.firstName} {u.lastName}</span>
          </Link>
          <button onClick={() => sendRequest(u._id)} className="btn-add-friend">+</button>
        </div>
      ))}
    </div>
  );
}
