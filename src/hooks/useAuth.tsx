import { useEffect, useState, createContext, useContext } from 'react';
import { supabase } from '../supabaseClient';
import { createUserProfile } from '../api/userProfile';

// User type
export type User = {
  id: string;
  email: string;
  full_name?: string;
  bio?: string;
  avatar_url?: string;
};

// Auth context type
interface AuthContextType {
  user: User | null;
  signUp: (email: string, password: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // Helper to fetch full user profile
  const fetchAndSetUserProfile = async (supabaseUser: any) => {
    if (!supabaseUser) {
      setUser(null);
      return;
    }
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, full_name, bio, avatar_url')
      .eq('id', supabaseUser.id)
      .single();
    if (data) {
      const userData = {
        id: data.id,
        email: supabaseUser.email,
        full_name: data.full_name,
        bio: data.bio,
        avatar_url: data.avatar_url,
      };
      setUser(userData);
    } else {
      // If no profile, create one and set minimal info
      await createUserProfile(supabaseUser.id, supabaseUser.email.split('@')[0]);
      const userData = {
        id: supabaseUser.id,
        email: supabaseUser.email,
        full_name: '',
        bio: '',
        avatar_url: '',
      };
      setUser(userData);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }: { data: any }) => {
      if (data.session?.user) {
        fetchAndSetUserProfile(data.session.user);
      } else {
        setUser(null);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      if (session?.user) {
        fetchAndSetUserProfile(session.user);
      } else {
        setUser(null);
      }
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (data?.user) await fetchAndSetUserProfile(data.user);
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (data?.user) await fetchAndSetUserProfile(data.user);
    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const refreshUser = async () => {
    if (user && user.id) {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, full_name, bio, avatar_url')
        .eq('id', user.id)
        .single();
      if (data) {
        const userData = {
          id: data.id,
          email: user.email,
          full_name: data.full_name,
          bio: data.bio,
          avatar_url: data.avatar_url,
        };
        setUser(userData);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, signUp, signIn, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}; 