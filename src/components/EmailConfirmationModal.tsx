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
      position: 'fixed', inset: 0, background: 'rgba(161,196,253,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(8px)'
    }} onClick={onClose}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(189,180,254,0.85) 0%, rgba(161,196,253,0.85) 100%)',
        borderRadius: 24, padding: '2rem', maxWidth: 400, width: '90%', boxShadow: '0 20px 40px rgba(161,196,253,0.18), 0 2px 12px rgba(189,180,254,0.10)', border: '1.5px solid rgba(189,180,254,0.25)', position: 'relative', textAlign: 'center',
      }} onClick={e => e.stopPropagation()}>
        <button style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 24, color: '#888', cursor: 'pointer' }} onClick={onClose}>&times;</button>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#22223b', marginBottom: 16 }}>Confirm your email</h2>
        <p style={{ color: '#444', marginBottom: 16 }}>A confirmation email has been sent to <b>{email}</b>.<br />Please check your inbox and follow the instructions to activate your account.</p>
        <button style={{ padding: '0.8rem 2rem', borderRadius: 10, background: 'linear-gradient(90deg, #a1c4fd 0%, #bdb4fe 100%)', color: '#22223b', fontWeight: 700, border: 'none', boxShadow: '0 2px 8px rgba(161,196,253,0.10)', cursor: 'pointer' }} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}; 