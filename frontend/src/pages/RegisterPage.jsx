import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AlertMessage from '../components/AlertMessage';
import { BookIcon, UserIcon, ShieldIcon } from '../components/Icons';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (formError) setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validations
    if (!formData.name.trim()) {
      return setFormError('Please enter your full name.');
    }
    if (!formData.email.trim()) {
      return setFormError('Please enter your email address.');
    }
    if (!formData.password) {
      return setFormError('Please choose a password.');
    }
    if (formData.password.length < 6) {
      return setFormError('Password must be at least 6 characters long.');
    }
    if (formData.password !== formData.confirmPassword) {
      return setFormError('Passwords do not match. Please verify.');
    }

    try {
      setLoading(true);
      const res = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      if (res.success) {
        navigate('/dashboard');
      } else {
        setFormError(res.message);
      }
    } catch (err) {
      setFormError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-card-header">
          <div className="auth-icon-wrap">
            <BookIcon size={28} />
          </div>
          <h2>Create Student Account</h2>
          <p>Join the Smart Study Material Sharing Platform</p>
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
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="e.g. Rahul Sharma"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">College / Personal Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="student@college.edu or email@domain.com"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password (Minimum 6 characters)</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
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
            {loading ? 'Creating Account...' : 'Register as Student'}
          </button>
        </form>

        <div className="auth-card-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
