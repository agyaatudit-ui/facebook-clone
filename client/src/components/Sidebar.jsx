import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user } = useAuth();

  const links = [
    { to: `/profile/${user?._id}`, label: `${user?.firstName} ${user?.lastName}`, icon: 'person' },
    { to: '/friends', label: 'Friends', icon: 'group' },
  ];

  return (
    <aside className="sidebar">
      {links.map((l) => (
        <Link key={l.to} to={l.to} className="sidebar-link">
          <div className="sidebar-icon">
            {l.icon === 'person' ? (
              <img src={user?.avatar ? `https://facebook-clone-api-52k8.onrender.com${user.avatar}` : 'https://via.placeholder.com/36'} alt="" className="sidebar-avatar" />
            ) : (
              <svg viewBox="0 0 24 24" width="28" height="28"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" fill="currentColor"/></svg>
            )}
          </div>
          <span>{l.label}</span>
        </Link>
      ))}
    </aside>
  );
}
