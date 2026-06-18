import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function Friends() {
  const { user, updateUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState('suggestions');

  const pendingRequests = user?.friendRequests?.filter((r) => r.status === 'pending') || [];

  useEffect(() => {
    if (tab === 'suggestions') {
      API.get('/users/suggestions').then(({ data }) => setUsers(data)).catch(() => {});
    } else if (tab === 'requests') {
      Promise.all(pendingRequests.map((r) =>
        API.get(`/users/${r.from}`).then(({ data }) => data)
      )).then(setUsers).catch(() => {});
    } else if (tab === 'all') {
      API.get('/users/search?q=').then(({ data }) => setUsers(data)).catch(() => {});
    }
  }, [tab]);

  const sendRequest = async (id) => {
    try {
      await API.post(`/users/friend-request/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {}
  };

  const acceptRequest = async (id) => {
    try {
      await API.post(`/users/friend-request/${id}/accept`);
      const { data } = await API.get('/auth/me');
      updateUser(data);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {}
  };

  const declineRequest = async (id) => {
    try {
      await API.post(`/users/friend-request/${id}/decline`);
      const { data } = await API.get('/auth/me');
      updateUser(data);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {}
  };

  return (
    <div className="friends-page">
      <div className="friends-header">
        <h2>Friends</h2>
        <div className="friends-tabs">
          <button className={tab === 'suggestions' ? 'active' : ''} onClick={() => setTab('suggestions')}>Suggestions</button>
          <button className={tab === 'requests' ? 'active' : ''} onClick={() => setTab('requests')}>
            Requests {pendingRequests.length > 0 && <span className="badge">{pendingRequests.length}</span>}
          </button>
          <button className={tab === 'all' ? 'active' : ''} onClick={() => setTab('all')}>All Users</button>
        </div>
      </div>
      <div className="friends-grid-large">
        {users.length === 0 && <p className="empty-text">No users found</p>}
        {users.map((u) => (
          <div key={u._id} className="friend-card-large">
            <Link to={`/profile/${u._id}`}>
              <img src={u.avatar ? `http://localhost:5000${u.avatar}` : 'https://via.placeholder.com/150'} alt="" />
              <h4>{u.firstName} {u.lastName}</h4>
            </Link>
            {tab === 'suggestions' && (
              <button onClick={() => sendRequest(u._id)} className="btn-primary">Add Friend</button>
            )}
            {tab === 'requests' && (
              <div className="request-actions">
                <button onClick={() => acceptRequest(u._id)} className="btn-primary">Confirm</button>
                <button onClick={() => declineRequest(u._id)} className="btn-secondary">Delete</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
