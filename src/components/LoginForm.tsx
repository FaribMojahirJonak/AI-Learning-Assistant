import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function LoginForm() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const { data, error } = await signIn(email, password);
    if (error) {
      setError(error.message);
      return;
    }
    if (data.user) {
      setSuccess('Login successful!');
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4 max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
      <input className="input input-bordered w-full" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      <input className="input input-bordered w-full" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
      <button className="btn btn-primary w-full" type="submit">Login</button>
      {error && <div className="text-red-500">{error}</div>}
      {success && <div className="text-green-600">{success}</div>}
    </form>
  );
} 