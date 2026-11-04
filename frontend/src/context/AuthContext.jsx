import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('smart_study_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('smart_study_token') || null;
  });

  const [loading, setLoading] = useState(true);

  // Check current session validity on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('smart_study_token');
      if (storedToken) {
        try {
          const res = await authAPI.getMe();
          if (res.data && res.data.success) {
            setUser(res.data.user);
            localStorage.setItem(
              'smart_study_user',
              JSON.stringify(res.data.user)
            );
          }
        } catch (err) {
          console.warn('[Session expired or invalid token]:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authAPI.login({ email, password });
      if (res.data && res.data.success) {
        const { token, user } = res.data;
        setToken(token);
        setUser(user);
        localStorage.setItem('smart_study_token', token);
        localStorage.setItem('smart_study_user', JSON.stringify(user));
        return { success: true, user };
      }
      return { success: false, message: 'Invalid credentials' };
    } catch (err) {
      const message =
        err.response?.data?.message || 'Login failed. Please try again.';
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      const res = await authAPI.register(userData);
      if (res.data && res.data.success) {
        const { token, user, message } = res.data;
        setToken(token);
        setUser(user);
        localStorage.setItem('smart_study_token', token);
        localStorage.setItem('smart_study_user', JSON.stringify(user));
        return { success: true, message, user };
      }
      return { success: false, message: 'Registration failed' };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Registration failed. Please check your details.';
      return { success: false, message };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('smart_study_token');
    localStorage.removeItem('smart_study_user');
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
