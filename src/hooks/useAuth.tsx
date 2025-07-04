import { useEffect, useState, createContext, useContext } from 'react';
import { supabase } from '../supabaseClient';
import { createUserProfile } from '../api/userProfile';

// User type
export type User = {
  id: string;
  email: string;
};

// Auth context type
interface AuthContextType {
  user: User | null;
  signUp: (email: string, password: string, redirectTo?: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
}

// Provide a dummy context with no logic
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }: { data: any }) => {
      if (data.session?.user) {
        setUser({ id: data.session.user.id, email: data.session.user.email! });
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email! });
      } else {
        setUser(null);
      }
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user) {
      supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user.id)
        .single()
        .then(({ data, error }: { data: any; error: any }) => {
          if (!data && !error) {
            createUserProfile(user.id, user.email.split('@')[0]);
          } else if (error && error.code === 'PGRST116') {
            // No rows returned - profile doesn't exist
            createUserProfile(user.id, user.email.split('@')[0]);
          } else if (error) {
            console.error('Error checking user profile:', error);
          }
        });
    }
  }, [user]);

  const signUp = async (email: string, password: string, redirectTo?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo || 'https://ai-learning-assistant-hazel.vercel.app/'
      }
    });
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
// All authentication logic removed from this file 