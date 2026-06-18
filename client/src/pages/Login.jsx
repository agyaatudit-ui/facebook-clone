import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-left">
          <h1 className="auth-logo">facebook</h1>
          <p className="auth-tagline">Connect with friends and the world around you on Facebook.</p>
        </div>
        <div className="auth-right">
          <form className="auth-form" onSubmit={handleSubmit}>
            <h2>Log In</h2>
            {error && <div className="auth-error">{error}</div>}
            <input type="email" placeholder="Email address" value={email}
              onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={password}
              onChange={(e) => setPassword(e.target.value)} required />
            <button type="submit" className="btn-primary btn-login">Log In</button>
            <div className="auth-divider"><span>or</span></div>
            <Link to="/register" className="btn-create-account">Create New Account</Link>
          </form>
        </div>
      </div>
    </div>
  );
}
