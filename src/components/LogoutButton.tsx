import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function LogoutButton() {
  const { signOut } = useAuth();
  const [success, setSuccess] = useState('');

  const handleLogout = async () => {
    await signOut();
    setSuccess('Logged out successfully!');
  };

  return (
    <div className="my-4">
      <button className="btn btn-secondary" onClick={handleLogout}>Logout</button>
      {success && <div className="text-green-600 mt-2">{success}</div>}
    </div>
  );
} 