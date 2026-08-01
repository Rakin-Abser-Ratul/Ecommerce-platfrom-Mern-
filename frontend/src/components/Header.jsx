import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // adjust path as needed
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header-container">
      <nav className="custom-navbar">
        <Link className="navbar-brand-custom" to="/">
          <span className="brand-accent">Daraz</span> 
        </Link>
        
        <div className="navbar-buttons-custom">
          {isAuthenticated ? (
            <>
              <Link className="nav-btn btn-dashboard" to="/dashboard">
                Dashboard
              </Link>
              <button 
                type="button" 
                className="nav-btn btn-logout" 
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="nav-btn btn-login" to="/login">
                Login
              </Link>
              <Link className="nav-btn btn-register" to="/register">
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;