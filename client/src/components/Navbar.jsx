import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import API from '../api/axios';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    if (!user) return;
    API.get('/notifications/unread-count').then(({ data }) => setNotifCount(data.count)).catch(() => {});
    API.get('/notifications').then(({ data }) => setNotifications(data)).catch(() => {});
    if (!socket) return;
    socket.on('notification', (notif) => {
      setNotifications((prev) => [notif, ...prev]);
      setNotifCount((c) => c + 1);
    });
    return () => socket.off('notification');
  }, [user, socket]);

  const handleSearch = async (e) => {
    const q = e.target.value;
    setSearch(q);
    if (q.length < 2) return setResults([]);
    const { data } = await API.get(`/users/search?q=${q}`);
    setResults(data);
  };

  const markRead = async () => {
    await API.put('/notifications/read');
    setNotifCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const notifText = (n) => {
    const name = `${n.from?.firstName || ''} ${n.from?.lastName || ''}`;
    switch (n.type) {
      case 'friend_request': return `${name} sent you a friend request`;
      case 'friend_accept': return `${name} accepted your friend request`;
      case 'like': return `${name} liked your post`;
      case 'comment': return `${name} commented on your post`;
      default: return '';
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-logo">facebook</Link>
        <div className="search-box">
          <input type="text" placeholder="Search Facebook" value={search}
            onChange={handleSearch} onFocus={() => setShowSearch(true)}
            onBlur={() => setTimeout(() => setShowSearch(false), 200)} />
          {showSearch && results.length > 0 && (
            <div className="search-results">
              {results.map((u) => (
                <Link key={u._id} to={`/profile/${u._id}`} className="search-item"
                  onMouseDown={() => navigate(`/profile/${u._id}`)}>
                  <img src={u.avatar ? `http://localhost:5000${u.avatar}` : 'https://via.placeholder.com/40'} alt="" />
                  <span>{u.firstName} {u.lastName}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="navbar-center">
        <Link to="/" className="nav-icon active" title="Home">
          <svg viewBox="0 0 24 24" width="28" height="28"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" fill="currentColor"/></svg>
        </Link>
        <Link to="/friends" className="nav-icon" title="Friends">
          <svg viewBox="0 0 24 24" width="28" height="28"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" fill="currentColor"/></svg>
        </Link>
      </div>
      <div className="navbar-right">
        <div className="nav-icon-wrapper" onClick={() => { setShowNotif(!showNotif); if (!showNotif) markRead(); }}>
          <svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" fill="currentColor"/></svg>
          {notifCount > 0 && <span className="badge">{notifCount}</span>}
          {showNotif && (
            <div className="dropdown notif-dropdown">
              <h4>Notifications</h4>
              {notifications.length === 0 && <p className="empty-text">No notifications</p>}
              {notifications.map((n) => (
                <div key={n._id} className={`notif-item ${!n.read ? 'unread' : ''}`}>
                  <img src={n.from?.avatar ? `http://localhost:5000${n.from.avatar}` : 'https://via.placeholder.com/36'} alt="" />
                  <span>{notifText(n)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="profile-trigger" onClick={() => setShowProfile(!showProfile)}>
          <img src={user?.avatar ? `http://localhost:5000${user.avatar}` : 'https://via.placeholder.com/32'} alt="" className="nav-avatar" />
          <span>{user?.firstName}</span>
          {showProfile && (
            <div className="dropdown profile-dropdown">
              <Link to={`/profile/${user?._id}`} onClick={() => setShowProfile(false)}>View Profile</Link>
              <button onClick={handleLogout}>Log Out</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
