import { Request, Response } from "express";
import { supabaseAdmin } from "../../supabase/client";

export async function deleteUserHandler(
	req: Request,
	res: Response,
): Promise<void> {
	try {
		const supabase = req.supabase!;
		const userId = req.params.id || req.user!.id;

		if (!userId) {
			res.status(400).json({ success: false, message: "User ID is required" });
			return;
		}

		// Try to delete from user_profiles first (RLS will enforce permissions)
		const { error: profileError } = await supabase
			.from("user_profiles")
			.delete()
			.eq("user_id", userId);

		if (profileError) {
			// If RLS blocks, error.code may be '42501' (insufficient privilege)
			res.status(403).json({ success: false, message: "Not authorized to delete this user." });
			return;
		}

		// Now delete from Supabase Auth (admin privilege required)
		
		const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

		if (error) {
			res.status(400).json({ success: false, message: error.message });
			return;
		}

		res.status(200).json({
			success: true,
			message: `User ${userId} deleted successfully.`,
		});
	} catch (err) {
		console.error("Delete user error:", err);
		res.status(500).json({ success: false, message: "Internal server error" });
	}
}