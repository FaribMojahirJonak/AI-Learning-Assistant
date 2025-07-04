import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface UserProfileDropdownProps {
  user: { email: string; photoURL?: string };
  onSignOut?: () => void;
}

const UserIcon = () => (
  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.7)', boxShadow: '0 2px 8px rgba(161,196,253,0.10)' }}>
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="8" r="4.5" fill="#a1c4fd"/>
      <ellipse cx="12" cy="17" rx="7" ry="4" fill="#bdb4fe"/>
    </svg>
  </span>
);

export const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({ user, onSignOut }) => {
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

  return (
    <div style={{ position: 'relative', display: 'inline-block', marginLeft: 12 }} ref={menuRef}>
      {user.photoURL ? (
        <img
          src={user.photoURL}
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
        <button
          className="navbar-user-dropdown-btn"
          onClick={() => { setOpen(false); navigate('/profile'); }}
        >
          Profile
        </button>
        <button
          className="navbar-user-dropdown-btn logout"
          onClick={() => { setOpen(false); onSignOut && onSignOut(); navigate('/'); }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}; 