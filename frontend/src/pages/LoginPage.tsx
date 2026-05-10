import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome aboard! 🚢');
      navigate('/');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role: 'admin' | 'crew') => {
    if (role === 'admin') setForm({ email: 'admin@fathommarine.com', password: 'admin123' });
    else setForm({ email: 'john@fathommarine.com', password: 'crew123' });
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">⚓</div>
          <div className="login-title">Fathom Marine</div>
          <div className="login-subtitle">Maritime Operations & Compliance System</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder="your@email.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
            />
          </div>

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '14px', marginTop: '8px' }}
            disabled={loading}
          >
            {loading ? '⏳ Signing in...' : '🔐 Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '20px', padding: '16px', background: 'var(--glass)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Quick Demo Access
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button id="demo-admin" className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => fillDemo('admin')}>
              👑 Admin
            </button>
            <button id="demo-crew" className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => fillDemo('crew')}>
              ⚙️ Crew
            </button>
          </div>
        </div>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Secure Maritime Operations Platform
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
