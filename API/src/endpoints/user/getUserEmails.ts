import { Request, Response } from "express";

export async function getUserEmailsHandler(req: Request, res: Response): Promise<void> {
	try {
		const supabase = req.supabase!;

		const { data, error } = await supabase
			.from("user_profiles")
			.select("email");

		if (error) throw error;

		const emails = data?.map(profile => profile.email).filter(Boolean) || [];

		res.status(200).json({
			success: true,
			emails,
		});
	} catch (error: any) {
		console.error("Get user emails error:", error);
		res.status(500).json({ error: error.message || "Internal server error" });
	}
}
