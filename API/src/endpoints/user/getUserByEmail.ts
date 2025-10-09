import { Request, Response } from "express";

export async function getUserProfileByEmailHandler(
	req: Request,
	res: Response,
): Promise<void> {
	try {
		const supabase = req.supabase!;
		const email = req.params.email;

		if (!email) {
			res.status(400).json({ success: false, message: "Email is required" });
			return;
		}

		// Fetch profile from user_profiles table by email
		const { data: profile, error: profileError } = await supabase
			.from("user_profiles")
			.select("*")
			.eq("email", email)
			.maybeSingle();

		if (profileError) {
			throw profileError;
		}

		if (!profile) {
			res.status(404).json({ success: false, message: "Profile not found" });
			return;
		}

		res.status(200).json({ success: true, profile });
	} catch (error: any) {
		console.error("Get user profile by email error:", error);
		res.status(500).json({ error: error.message || "Internal server error" });
	}
}