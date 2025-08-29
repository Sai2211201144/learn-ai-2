import { supabase } from './supabaseClient';
import { User } from '../types';

// This is the shape of the JSONB data we'll store in Supabase
type AppData = Omit<User, 'id' | 'email' | 'name' | 'picture'>;

const INITIAL_APP_DATA: AppData = {
    xp: 0,
    level: 1,
    achievements: [],
    articles: [],
    folders: [],
    learningPlans: [],
    habits: [],
    courses: [],
    projects: [],
};


export const getOrCreateUserProfile = async (firebaseUser: { uid: string; email: string | null; displayName: string | null; photoURL: string | null }): Promise<User> => {
    // 1. Check for an existing profile
    const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', firebaseUser.uid)
        .single();

    if (profileError && profileError.code !== 'PGRST116') { // PGRST116: "Not found"
        console.error('Error fetching profile:', profileError);
        throw profileError;
    }

    // 2. If profile exists, fetch app data
    if (profile) {
        const { data: appData, error: appDataError } = await supabase
            .from('user_app_data')
            .select('data')
            .eq('user_id', firebaseUser.uid)
            .single();
        
        if (appDataError) {
            console.error('Error fetching app data:', appDataError);
            throw appDataError;
        }

        return {
            id: profile.id,
            email: profile.email,
            name: profile.full_name || 'Learner',
            picture: profile.avatar_url || undefined,
            ...(appData?.data || INITIAL_APP_DATA)
        };
    } 
    // 3. If no profile, create one and initialize app data
    else {
        const { data: newProfile, error: insertError } = await supabase
            .from('user_profiles')
            .insert({
                id: firebaseUser.uid,
                email: firebaseUser.email,
                full_name: firebaseUser.displayName,
                avatar_url: firebaseUser.photoURL,
            })
            .select()
            .single();

        if (insertError) {
            console.error('Error creating profile:', insertError);
            throw insertError;
        }

        const { error: appDataError } = await supabase
            .from('user_app_data')
            .insert({ user_id: firebaseUser.uid, data: INITIAL_APP_DATA });
        
        if (appDataError) {
            console.error('Error creating initial app data:', appDataError);
            // We should probably roll back the profile creation here in a real app
            throw appDataError;
        }

        return {
            id: newProfile.id,
            email: newProfile.email,
            name: newProfile.full_name || 'Learner',
            picture: newProfile.avatar_url || undefined,
            ...INITIAL_APP_DATA
        };
    }
};

export const saveAppData = async (userId: string, data: AppData) => {
    const { error } = await supabase
        .from('user_app_data')
        .update({ data: data, updated_at: new Date().toISOString() })
        .eq('user_id', userId);

    if (error) {
        console.error('Error saving app data:', error);
        throw error;
    }
};