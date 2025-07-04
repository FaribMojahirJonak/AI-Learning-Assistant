import React from 'react';

interface EmailConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

export const EmailConfirmationModal: React.FC<EmailConfirmationModalProps> = ({ isOpen, onClose, email }) => {
  if (!isOpen) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(161,196,253,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(8px)'
    }} onClick={onClose}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(232,240,255,0.85) 100%)',
        borderRadius: 24, padding: '2rem', maxWidth: 400, width: '90%', boxShadow: '0 20px 40px rgba(161,196,253,0.18), 0 2px 12px rgba(189,180,254,0.10)', border: '1.5px solid rgba(189,180,254,0.18)', position: 'relative', textAlign: 'center',
      }} onClick={e => e.stopPropagation()}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#22223b', marginBottom: 16 }}>Confirm your email</h2>
        <p style={{ color: '#444', marginBottom: 16 }}>A confirmation email has been sent to <b>{email}</b>.<br />Please check your inbox and follow the instructions to activate your account.</p>
        <button
          style={{
            padding: '0.8rem 2rem',
            borderRadius: 12,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(232,240,255,0.25) 100%)',
            color: '#22223b',
            fontWeight: 400,
            border: '1.5px solid rgba(189,180,254,0.18)',
            boxShadow: '0 2px 8px rgba(161,196,253,0.10)',
            backdropFilter: 'blur(8px)',
            cursor: 'pointer',
            transition: 'background 0.2s, box-shadow 0.2s',
            outline: 'none',
          }}
          onMouseOver={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(135deg, rgba(232,240,255,0.55) 0%, rgba(255,255,255,0.45) 100%)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(161,196,253,0.18)';
          }}
          onMouseOut={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(232,240,255,0.25) 100%)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 8px rgba(161,196,253,0.10)';
          }}
          onMouseDown={e => {
            (e.currentTarget as HTMLButtonElement).style.outline = 'none';
          }}
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}; 