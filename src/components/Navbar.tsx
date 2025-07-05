import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoginModal } from './LoginModal';
import { UserProfileDropdown } from './UserProfileDropdown';
import './Navbar.css';
import quizenceLogo from '../assets/quizence-logo.png';

export const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const openLoginModal = (signUp: boolean = false) => {
    setIsSignUp(signUp);
    setShowLoginModal(true);
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="navbar-root">
        <div className="navbar-container">
          <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
            <img src={quizenceLogo} alt="Quizence Logo" className="navbar-logo-img" width={36} height={36} />
            <span className="navbar-title">Quizence</span>
          </Link>

          {/* Mobile hamburger menu button */}
          <button 
            className={`navbar-hamburger ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {/* Desktop navigation */}
          <div className="navbar-links desktop-only">
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

          <div className="navbar-auth desktop-only">
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

        {/* Mobile menu overlay */}
        <div className={`navbar-mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="navbar-mobile-content">
            <div className="navbar-mobile-links">
              <Link
                to="/"
                className={`navbar-mobile-link${location.pathname === '/' ? ' active' : ''}`}
                onClick={closeMobileMenu}
              >
                Home
              </Link>
              <Link
                to="/learn"
                className={`navbar-mobile-link${location.pathname === '/learn' ? ' active' : ''}`}
                onClick={closeMobileMenu}
              >
                Learn
              </Link>
            </div>

            <div className="navbar-mobile-auth">
              {user ? (
                <div className="navbar-mobile-user">
                  <div className="navbar-mobile-user-info">
                    <span className="navbar-mobile-user-email">{user.email}</span>
                  </div>
                  <button
                    onClick={() => {
                      signOut();
                      closeMobileMenu();
                    }}
                    className="navbar-mobile-btn navbar-mobile-btn-logout"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="navbar-mobile-auth-btns">
                  <button
                    onClick={() => openLoginModal(false)}
                    className="navbar-mobile-btn"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => openLoginModal(true)}
                    className="navbar-mobile-btn navbar-mobile-btn-primary"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
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