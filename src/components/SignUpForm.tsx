import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { createUserProfile } from '../api/userProfile';

export default function SignUpForm() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await signUp(email, password);
      if (error) throw error;

      if (data.user) {
        // Create user profile
        const { error: profileError } = await createUserProfile(data.user.id, fullName || email.split('@')[0]);

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }
      }

      setSuccess('Account created successfully! Please check your email to verify your account.');
      setEmail('');
      setPassword('');
      setFullName('');
    } catch (error: any) {
      setError(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignUp} className="space-y-4 max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
      <input className="input input-bordered w-full" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      <input className="input input-bordered w-full" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
      <input className="input input-bordered w-full" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Full Name" />
      <button className="btn btn-primary w-full" type="submit" disabled={loading}>
        {loading ? 'Creating Account...' : 'Sign Up'}
      </button>
      {error && <div className="text-red-500">{error}</div>}
      {success && <div className="text-green-600">{success}</div>}
    </form>
  );
} 