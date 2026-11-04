import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AlertMessage from '../components/AlertMessage';
import { BookIcon, ShieldIcon, UserIcon } from '../components/Icons';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      return setFormError('Please enter both email and password.');
    }

    try {
      setLoading(true);
      const res = await login(email.trim(), password);

      if (res.success) {
        if (from) {
          navigate(from, { replace: true });
        } else if (res.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        setFormError(res.message);
      }
    } catch (err) {
      setFormError('Failed to sign in. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill helper for testing & demonstrations
  const fillCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setFormError('');
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-card-header">
          <div className="auth-icon-wrap">
            <BookIcon size={28} />
          </div>
          <h2>Welcome Back</h2>
          <p>Sign in to access your study materials & dashboard</p>
        </div>

        {formError && (
          <AlertMessage
            type="error"
            message={formError}
            onClose={() => setFormError('')}
          />
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Registered Email Address</label>
            <input
              type="email"
              id="email"
              placeholder="e.g. student@smartstudy.edu"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (formError) setFormError('');
              }}
              required
              disabled={loading}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Account Password</label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (formError) setFormError('');
              }}
              required
              disabled={loading}
              className="form-control"
            />
          </div>

          <button
            type="submit"
            className="btn-auth-submit"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Credentials Box for College Viva & Fast Testing */}
        <div className="demo-credentials-box">
          <span className="demo-title">Quick Demo Sign-In:</span>
          <div className="demo-buttons">
            <button
              type="button"
              className="btn-demo-badge student"
              onClick={() => fillCredentials('student@smartstudy.edu', 'Student@123')}
            >
              <UserIcon size={12} /> Student Demo
            </button>
            <button
              type="button"
              className="btn-demo-badge admin"
              onClick={() => fillCredentials('admin@smartstudy.edu', 'Admin@123')}
            >
              <ShieldIcon size={12} /> Admin Demo
            </button>
          </div>
        </div>

        <div className="auth-card-footer">
          <p>
            Don't have an account yet?{' '}
            <Link to="/register" className="auth-link">
              Register as Student
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
