import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../supabaseClient';
import './ProfileSettings.css';

interface UserProfile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
}

// Extended user type for Supabase user with metadata
interface SupabaseUser {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
  created_at?: string;
  last_sign_in_at?: string;
}

const UserIcon = () => (
  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 96, height: 96, borderRadius: '50%', background: 'rgba(255,255,255,0.7)', boxShadow: '0 2px 8px rgba(161,196,253,0.10)' }}>
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="8" r="4.5" fill="#a1c4fd" />
      <ellipse cx="12" cy="17" rx="7" ry="4" fill="#bdb4fe" />
    </svg>
  </span>
);

type SuccessPopupProps = {
  show: boolean;
  onClose: () => void;
  message: string;
};

const SuccessPopup: React.FC<SuccessPopupProps> = ({ show, onClose, message }) => {
  if (!show) return null;
  return (
    <div className="success-popup-overlay">
      <div className="success-popup-modal">
        <div className="success-popup-animation">
          <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
            <circle cx="36" cy="36" r="34" stroke="#a1c4fd" strokeWidth="4" fill="#fff"/>
            <path d="M22 38L32 48L50 28" stroke="#5a4fcf" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
              <animate attributeName="stroke-dasharray" from="0,40" to="40,0" dur="0.5s" fill="freeze" />
            </path>
          </svg>
        </div>
        <div className="success-popup-message">{message}</div>
        <button className="success-popup-close" onClick={onClose}>&times;</button>
      </div>
    </div>
  );
};

export const ProfileSettings: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Form states
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  useEffect(() => {
    if (user) {
      // Get the actual Supabase user object
      supabase.auth.getUser().then(({ data: { user: supabaseUserData } }) => {
        if (supabaseUserData) {
          setSupabaseUser(supabaseUserData as SupabaseUser);
        }
      });
    }
  }, [user]);

  useEffect(() => {
    if (supabaseUser) {
      fetchProfile();
    }
  }, [supabaseUser]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', supabaseUser?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
        setFullName(data.full_name || '');
        setBio(data.bio || '');
        setAvatarPreview(data.avatar_url || '');
      } else {
        // Create profile if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert([
            {
              id: supabaseUser?.id,
              full_name: supabaseUser?.user_metadata?.full_name || '',
              avatar_url: supabaseUser?.user_metadata?.avatar_url || '',
            }
          ])
          .select()
          .single();

        if (createError) throw createError;
        setProfile(newProfile);
        setFullName(newProfile.full_name || '');
        setBio(newProfile.bio || '');
        setAvatarPreview(newProfile.avatar_url || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage({ type: 'error', text: 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async (file: File): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${supabaseUser?.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Avatar upload error:', uploadError);
        throw new Error(`Failed to upload avatar: ${uploadError.message}`);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Avatar upload failed:', error);
      throw new Error('Failed to upload avatar. Please try again.');
    }
  };

  const updateProfile = async () => {
    if (!supabaseUser) return;

    setSaving(true);
    setMessage(null);

    try {
      let avatarUrl = profile?.avatar_url;

      // Upload new avatar if selected
      if (avatarFile) {
        avatarUrl = await uploadAvatar(avatarFile);
      }

      // Update profile in database
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: supabaseUser.id,
          full_name: fullName,
          bio,
          avatar_url: avatarUrl,
        });

      if (profileError) throw profileError;

      // Update user metadata
      const { error: userError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          avatar_url: avatarUrl,
        }
      });

      if (userError) throw userError;

      setProfile(prev => prev ? { ...prev, full_name: fullName, bio, avatar_url: avatarUrl } : null);
      setShowSuccess(true);
      setAvatarFile(null);
      // Refresh global user context so navbar/profile update
      if (refreshUser) await refreshUser();
    } catch (error) {
      console.error('Error updating profile:', error);
      let errorMessage = 'Failed to update profile';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        // Handle Supabase errors
        const supabaseError = error as any;
        if (supabaseError.message) {
          errorMessage = supabaseError.message;
        } else if (supabaseError.error_description) {
          errorMessage = supabaseError.error_description;
        }
      }
      
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setSaving(false);
    }
  };

  const updatePassword = async () => {
    if (!supabaseUser) return;

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error updating password:', error);
      setMessage({ type: 'error', text: 'Failed to update password' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-container">
        <div className="settings-card">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Profile Settings</h1>
        <p>Manage your account and preferences</p>
      </div>

      <SuccessPopup show={showSuccess} onClose={() => setShowSuccess(false)} message="Profile updated successfully!" />

      <div className="settings-grid">
        {/* Profile Information */}
        <div className="settings-card">
          <div className="card-header">
            <h2>Profile Information</h2>
            <p>Update your personal details</p>
          </div>

          <div className="avatar-section">
            <div className="avatar-container">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Profile"
                  className="avatar-preview"
                />
              ) : (
                <UserIcon />
              )}
              <div className="avatar-overlay">
                <label htmlFor="avatar-upload" className="avatar-upload-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </label>
              </div>
            </div>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <p className="avatar-hint">Click to upload a new profile picture</p>
          </div>

          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={user?.email || ''}
              disabled
              className="form-input disabled"
            />
            <small>Email cannot be changed</small>
          </div>

          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={4}
              className="form-textarea"
            />
          </div>

          <button
            onClick={updateProfile}
            disabled={saving}
            className="save-btn"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Password Settings */}
        <div className="settings-card">
          <div className="card-header">
            <h2>Password Settings</h2>
            <p>Update your password</p>
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="form-input"
            />
          </div>

          <button
            onClick={updatePassword}
            disabled={saving || !newPassword || !confirmPassword}
            className="save-btn"
          >
            {saving ? 'Updating...' : 'Update Password'}
          </button>
        </div>

        {/* Account Information */}
        <div className="settings-card">
          <div className="card-header">
            <h2>Account Information</h2>
            <p>Your account details</p>
          </div>

          <div className="info-group">
            <label>Member Since</label>
            <p className="info-value">
              {new Date(supabaseUser?.created_at || '').toLocaleDateString()}
            </p>
          </div>

          <div className="info-group">
            <label>Last Sign In</label>
            <p className="info-value">
              {new Date(supabaseUser?.last_sign_in_at || '').toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}; 