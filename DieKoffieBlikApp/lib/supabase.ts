import { SUPABASE_PUBLIC_URL, SUPABASE_PRIVATE_KEY } from "@env";
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const supabase = createClient(SUPABASE_PUBLIC_URL, SUPABASE_PRIVATE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
