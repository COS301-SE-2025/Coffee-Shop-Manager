import { SupabaseClient } from "@supabase/supabase-js";

declare global {
  namespace Express {
    interface Request {
      supabase?: SupabaseClient;
      user?: { id: string; [key: string]: any };
    }
  }
}

export {};