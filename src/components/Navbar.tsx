import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoginModal } from './LoginModal';
import { UserProfileDropdown } from './UserProfileDropdown';
import './Navbar.css';

export const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const location = useLocation();

  const openLoginModal = (signUp: boolean = false) => {
    setIsSignUp(signUp);
    setShowLoginModal(true);
  };

  return (
    <>
      <nav className="navbar-root">
        <div className="navbar-container">
          <Link to="/" className="navbar-logo">
            <span className="navbar-logo-icon">🎓</span>
            <span className="navbar-title">AI Learning Assistant</span>
          </Link>

          <div className="navbar-links">
            <Link
              to="/"
              className={`navbar-link${location.pathname === '/' ? ' navbar-link-active' : ''}`}
            >
              Home
            </Link>
            <Link
              to="/learn"
              className={`navbar-link${location.pathname === '/learn' ? ' navbar-link-active' : ''}`}
            >
              Learn
            </Link>
          </div>

          <div className="navbar-auth">
            {user ? (
              <UserProfileDropdown user={user} onSignOut={signOut} />
            ) : (
              <div className="navbar-auth-btns">
                <button
                  onClick={() => openLoginModal(false)}
                  className="navbar-btn"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openLoginModal(true)}
                  className="navbar-btn navbar-btn-primary"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        isSignUp={isSignUp}
        onToggleMode={() => setIsSignUp(!isSignUp)}
      />
    </>
  );
}; 