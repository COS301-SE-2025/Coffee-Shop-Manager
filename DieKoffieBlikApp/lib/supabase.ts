import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Make sure these are set in app.config.ts or app.json (under expo.extra)
const supabaseUrl = Constants.expoConfig?.extra?.SUPABASE_ONLINE_URL!;
const supabaseAnonKey = Constants.expoConfig?.extra?.ONLINE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Important for React Native
  },
});
