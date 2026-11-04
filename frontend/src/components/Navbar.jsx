import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BookIcon,
  UploadIcon,
  HeartIcon,
  UserIcon,
  LogOutIcon,
  ShieldIcon,
  MenuIcon,
  XIcon,
} from './Icons';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const closeMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        {/* Logo and Brand Name */}
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <div className="brand-icon-wrapper">
            <BookIcon size={24} />
          </div>
          <div className="brand-text">
            <span className="brand-title">SmartStudy</span>
            <span className="brand-subtitle">Material Sharing</span>
          </div>
        </Link>

        {/* Mobile Hamburger Toggle */}
        <button
          className="mobile-toggle-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
        </button>

        {/* Navigation Links */}
        <nav className={`navbar-nav ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="nav-links">
            <NavLink
              to="/"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              onClick={closeMenu}
              end
            >
              Home
            </NavLink>
            <NavLink
              to="/materials"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              onClick={closeMenu}
            >
              Study Materials
            </NavLink>

            {isAuthenticated && (
              <>
                <NavLink
                  to="/upload"
                  className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                  onClick={closeMenu}
                >
                  <UploadIcon size={16} /> Upload Notes
                </NavLink>

                <NavLink
                  to="/dashboard"
                  className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                  onClick={closeMenu}
                >
                  Dashboard
                </NavLink>

                <NavLink
                  to="/favorites"
                  className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                  onClick={closeMenu}
                >
                  <HeartIcon size={16} /> Saved
                </NavLink>

                <NavLink
                  to="/my-uploads"
                  className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                  onClick={closeMenu}
                >
                  My Uploads
                </NavLink>

                {isAdmin && (
                  <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                      isActive ? 'nav-link admin-pill active' : 'nav-link admin-pill'
                    }
                    onClick={closeMenu}
                  >
                    <ShieldIcon size={16} /> Admin Panel
                  </NavLink>
                )}
              </>
            )}
          </div>

          {/* User Auth Section */}
          <div className="nav-auth">
            {isAuthenticated ? (
              <div className="user-dropdown-area">
                <div className="user-pill" title={`Logged in as ${user?.role}`}>
                  <UserIcon size={16} />
                  <span className="user-display-name">{user?.name}</span>
                  {isAdmin && <span className="badge-admin">Admin</span>}
                </div>
                <button
                  onClick={handleLogout}
                  className="btn-logout"
                  title="Log out of account"
                >
                  <LogOutIcon size={16} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="guest-auth-btns">
                <Link to="/login" className="btn-nav-login" onClick={closeMenu}>
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-nav-register"
                  onClick={closeMenu}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
