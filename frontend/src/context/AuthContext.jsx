import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await API.get('/auth/me');
          setUser(res.data);
        } catch (err) {
          console.error('Session expired or invalid token:', err);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Login handler (FastAPI OAuth2PasswordRequestForm expects form-urlencoded)
  const login = async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email); // OAuth2 expects 'username' field
    formData.append('password', password);

    const res = await API.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const { access_token } = res.data;
    localStorage.setItem('token', access_token);

    // Fetch user profile immediately after getting the token
    const userRes = await API.get('/auth/me');
    setUser(userRes.data);
    return userRes.data;
  };

  // Register handler
  const register = async (username, email, password) => {
    const res = await API.post('/auth/register', {
      username,
      email,
      password,
    });
    return res.data;
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Boolean helper to check if a user is currently logged in
  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy consumption
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};