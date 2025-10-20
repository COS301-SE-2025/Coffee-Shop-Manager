import { createClient, SupabaseClient } from "@supabase/supabase-js";

export function getClient(accessToken?: string): SupabaseClient {
	if (!process.env.SUPABASE_PUBLIC_URL) throw new Error("Missing SUPABASE_PUBLIC_URL");
	if (!process.env.SUPABASE_PUBLIC_KEY) throw new Error("Missing SUPABASE_PUBLIC_KEY");

	// If an access token was provided, attach it; otherwise return an anon/public client
	const options = accessToken
		? { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
		: undefined;

	return createClient(
		process.env.SUPABASE_PUBLIC_URL!,
		process.env.SUPABASE_PUBLIC_KEY!,
		options,
	);
}

// Service client
export const supabaseAdmin = createClient(
	process.env.SUPABASE_PUBLIC_URL!,
	process.env.SUPABASE_PRIVATE_KEY!
);

// Optional factory to create an admin client per-request (rarely needed)
export function getAdminClient(): SupabaseClient {
	if (!process.env.SUPABASE_PUBLIC_URL) throw new Error("Missing SUPABASE_PUBLIC_URL");
	if (!process.env.SUPABASE_PRIVATE_KEY) throw new Error("Missing SUPABASE_PRIVATE_KEY");
	return createClient(process.env.SUPABASE_PUBLIC_URL!, process.env.SUPABASE_PRIVATE_KEY!);
}