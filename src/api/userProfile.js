// User profile creation logic removed. This file is now a placeholder to avoid import errors.
import { supabase } from '../supabaseClient';
export async function createUserProfile(userId, fullName, avatarUrl = '') {
    const { data, error } = await supabase
        .from('user_profiles')
        .insert([{ id: userId, full_name: fullName, avatar_url: avatarUrl }]);
    return { data, error };
}
