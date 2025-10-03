import { createClient, SupabaseClient } from "@supabase/supabase-js";

export function getClient(accessToken: string): SupabaseClient {
	if (!accessToken) throw new Error("Missing access token for Supabase client");
    if (!process.env.SUPABASE_PUBLIC_URL) throw new Error("Missing SUPABASE_PUBLIC_URL");
    if (!process.env.SUPABASE_PUBLIC_KEY) throw new Error("Missing SUPABASE_PUBLIC_KEY");
	
	// Client with token
	return createClient(
		process.env.SUPABASE_PUBLIC_URL!,
		process.env.SUPABASE_PUBLIC_KEY!,
		{
			global: { headers: { Authorization: `Bearer ${accessToken}` } }
		}
	);
}

// Service client
export const supabaseAdmin = createClient(
	process.env.SUPABASE_PUBLIC_URL!,
	process.env.SUPABASE_PRIVATE_KEY!
);