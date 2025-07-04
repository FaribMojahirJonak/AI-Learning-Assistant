import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState, createContext, useContext } from 'react';
import { supabase } from '../supabaseClient';
import { createUserProfile } from '../api/userProfile';
// Provide a dummy context with no logic
const AuthContext = createContext(undefined);
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            if (data.session?.user) {
                setUser({ id: data.session.user.id, email: data.session.user.email });
            }
        });
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setUser({ id: session.user.id, email: session.user.email });
            }
            else {
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
                .then(({ data, error }) => {
                if (!data && !error) {
                    createUserProfile(user.id, user.email.split('@')[0]);
                }
                else if (error && error.code === 'PGRST116') {
                    // No rows returned - profile doesn't exist
                    createUserProfile(user.id, user.email.split('@')[0]);
                }
                else if (error) {
                    console.error('Error checking user profile:', error);
                }
            });
        }
    }, [user]);
    const signUp = async (email, password) => {
        const { data, error } = await supabase.auth.signUp({ email, password });
        return { data, error };
    };
    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        return { data, error };
    };
    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };
    return (_jsx(AuthContext.Provider, { value: { user, signUp, signIn, signOut }, children: children }));
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context)
        throw new Error('useAuth must be used within AuthProvider');
    return context;
};
