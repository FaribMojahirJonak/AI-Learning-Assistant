import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const UserIcon = () => (
  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.7)', boxShadow: '0 2px 8px rgba(161,196,253,0.10)' }}>
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="8" r="4.5" fill="#a1c4fd"/>
      <ellipse cx="12" cy="17" rx="7" ry="4" fill="#bdb4fe"/>
    </svg>
  </span>
);

export const UserProfileDropdown: React.FC<{ onSignOut?: () => void }> = ({ onSignOut }) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  if (!user) {
    return null;
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block', marginLeft: 12 }} ref={menuRef}>
      {user.avatar_url ? (
        <img
          src={user.avatar_url}
          alt="User avatar"
          className="navbar-user-avatar"
          style={{ cursor: 'pointer', border: 'none', background: 'rgba(255,255,255,0.7)', boxShadow: '0 2px 8px rgba(161,196,253,0.10)' }}
          onClick={() => setOpen((v) => !v)}
        />
      ) : (
        <span style={{ cursor: 'pointer' }} onClick={() => setOpen((v) => !v)}>
          <UserIcon />
        </span>
      )}
      <div
        className={`navbar-user-dropdown${open ? ' open' : ''}`}
        style={{ position: 'absolute', top: 56, right: 0 }}
      >
        <div className="dropdown-header">
          <div className="user-info">
            <span className="user-email">{user.email}</span>
            <span className="user-status">Online</span>
          </div>
        </div>
        
        <button
          className="navbar-user-dropdown-btn"
          onClick={() => { setOpen(false); navigate('/profile'); }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          Profile
        </button>
        
        <button
          className="navbar-user-dropdown-btn"
          onClick={() => { setOpen(false); navigate('/settings'); }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          Settings
        </button>
        
        <div className="dropdown-divider"></div>
        
        <button
          className="navbar-user-dropdown-btn logout"
          onClick={() => { setOpen(false); onSignOut && onSignOut(); navigate('/'); }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16,17 21,12 16,7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Logout
        </button>
      </div>
    </div>
  );
}; 