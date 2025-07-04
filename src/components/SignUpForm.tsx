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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const { data, error } = await signUp(email, password);
    console.log('SignUp result:', { data, error });
    if (error) {
      setError(error.message);
      return;
    }
    // Supabase may not return data.user if email confirmation is required
    const userId = data.user?.id || data.session?.user?.id;
    if (userId) {
      const { error: profileError } = await createUserProfile(userId, fullName);
      console.log('Profile creation result:', { profileError });
      if (profileError) {
        setError('Profile creation failed: ' + profileError.message);
        return;
      }
      setSuccess('Sign up successful! Please check your email to confirm your account.');
    } else {
      setSuccess('Sign up successful! Please check your email to confirm your account. (Profile will be created after confirmation)');
    }
  };

  return (
    <form onSubmit={handleSignUp} className="space-y-4 max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
      <input className="input input-bordered w-full" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      <input className="input input-bordered w-full" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
      <input className="input input-bordered w-full" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Full Name" />
      <button className="btn btn-primary w-full" type="submit">Sign Up</button>
      {error && <div className="text-red-500">{error}</div>}
      {success && <div className="text-green-600">{success}</div>}
    </form>
  );
} 