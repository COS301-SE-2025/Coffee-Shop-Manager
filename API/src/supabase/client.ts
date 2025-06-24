import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const URL = process.env.SUPABASE_PUBLIC_URL!;
const KEY = process.env.SERVICE_ROLE_KEY!;

export const supabase = createClient(URL, KEY);