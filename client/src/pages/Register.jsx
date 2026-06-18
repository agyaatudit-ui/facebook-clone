import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', birthDate: '', gender: '' });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.password || !form.birthDate || !form.gender) {
      return setError('All fields are required');
    }
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-left">
          <h1 className="auth-logo">FriendsBook</h1>
          <p className="auth-tagline">Connect with friends and the world around you on FriendsBook.</p>
        </div>
        <div className="auth-right">
          <form className="auth-form" onSubmit={handleSubmit}>
            <h2>Create a new account</h2>
            <p className="auth-quick">It's quick and easy.</p>
            <div className="auth-divider"></div>
            {error && <div className="auth-error">{error}</div>}
            <div className="auth-row">
              <input name="firstName" placeholder="First name" value={form.firstName} onChange={handleChange} required />
              <input name="lastName" placeholder="Last name" value={form.lastName} onChange={handleChange} required />
            </div>
            <input name="email" type="email" placeholder="Email address" value={form.email} onChange={handleChange} required />
            <input name="password" type="password" placeholder="Password (6+ characters)" value={form.password} onChange={handleChange} required />
            <label className="auth-label">Birth date</label>
            <input name="birthDate" type="date" value={form.birthDate} onChange={handleChange} required />
            <label className="auth-label">Gender</label>
            <div className="auth-gender">
              <label><input type="radio" name="gender" value="male" onChange={handleChange} /> Male</label>
              <label><input type="radio" name="gender" value="female" onChange={handleChange} /> Female</label>
              <label><input type="radio" name="gender" value="other" onChange={handleChange} /> Other</label>
            </div>
            <button type="submit" className="btn-create-account" style={{ width: '100%', marginTop: 16 }}>Sign Up</button>
            <Link to="/login" className="auth-link">Already have an account? Log In</Link>
          </form>
        </div>
      </div>
    </div>
  );
}
