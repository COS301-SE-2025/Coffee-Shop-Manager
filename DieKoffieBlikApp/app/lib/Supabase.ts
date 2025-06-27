// lib/Supabase.ts
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.SUPABASE_ONLINE_URL!;
const supabaseAnonKey = Constants.expoConfig?.extra?.ONLINE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
