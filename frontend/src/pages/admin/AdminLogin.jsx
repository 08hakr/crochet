import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@evil.com');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await adminLogin(email.trim().toLowerCase(), password);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Admin login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: 'linear-gradient(135deg, var(--background) 0%, var(--secondary) 100%)'}}>
      <div className="card" style={{width: '100%', maxWidth: '420px', padding: '48px'}}>
        <div style={{textAlign: 'center', marginBottom: '32px'}}>
          <div style={{width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '2.5rem', color: 'var(--white)'}}>
            🔐
          </div>
          <h1 style={{fontSize: '1.8rem', marginBottom: '8px'}}>Admin Login</h1>
          <p style={{color: 'var(--text-light)'}}>Secure access to dashboard</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              required
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              required
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{width: '100%', padding: '14px', fontSize: '1rem'}} disabled={loading}>
            {loading ? 'Signing in...' : 'Access Dashboard'}
          </button>
        </form>

        <div style={{marginTop: '24px', padding: '16px', background: 'var(--background)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: 'var(--text-light)'}}>
          <strong>Default credentials:</strong><br />
          Email: admin<br />
          Password: admin
        </div>
      </div>
    </div>
  );
}