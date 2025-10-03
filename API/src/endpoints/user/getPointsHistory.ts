import { Request, Response } from "express";

export async function getUserPointsHistoryHandler(req: Request, res: Response): Promise<void> {
	try {
		const supabase = req.supabase!;
		const userId = req.user!.id;

		// Fetch loyalty points history for this user
		const { data, error } = await supabase
			.from("loyalty_points")
			.select("id, order_id, points, type, description, created_at")
			.eq("user_id", userId)
			.order("created_at", { ascending: false });

		if (error) throw error;

		res.status(200).json({
			success: true,
			history: data
		});
	} catch (error: any) {
		console.error("Get user points history error:", error);
		res.status(500).json({ error: error.message || "Internal server error" });
	}
}
