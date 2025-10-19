import { Request, Response } from "express";
import { getClient } from "../../supabase/client";

export async function loginHandler(req: Request, res: Response): Promise<void> {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			res
			.status(400)
			.json({ success: false, message: "Email and password required" });
			return;
		}

		const publicClient = getClient();
		const { data, error } = await publicClient.auth.signInWithPassword({
			email,
			password,
		});

		if (error || !data.user || !data.session) {
			res
			.status(401)
			.json({ success: false, message: error?.message || "Login failed" });
			return;
		}

		const { access_token, refresh_token } = data.session;

		res.cookie("access_token", access_token, {
			httpOnly: true,
			secure: true,
			sameSite: "none",
			maxAge: 10 * 365 * 24 * 60 * 60 * 1000, // long time
		});

		// For mobile
		res.setHeader("x-access-token", access_token);
		res.setHeader("x-refresh-token", refresh_token);

		const { data: profile, error: profileError } = await publicClient
			.from("user_profiles")
			.select("role, display_name")
			.eq("user_id", data.user.id)
			.single();

		if (profileError) {
			console.error("Error fetching user profile:", profileError.message);
		}

		// const user = data.user;
		res.status(200).json({
			success: true,
			user: {
				email: data.user.email,
				user_id: data.user.id,
				display_name: profile?.display_name || "Mr. Bean",
				role: profile?.role || null,
			},
			data: data.user,
		});

		// old response
		// res.status(200).json({
		// 	success: true,
		// 	// user: data.user,
		// 	user: {
		// 		user_metadata: {
		// 			role: "user"
		// 		}
		// 	},
		// 	username: data.user.user_metadata.display_name || "Mr. Bean",
		// });
	} catch (err) {
		console.error("Login error:", err);
		res.status(500).json({ success: false, message: "Internal server error" });
	}
}
