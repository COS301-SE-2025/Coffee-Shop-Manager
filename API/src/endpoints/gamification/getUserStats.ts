import { Request, Response } from "express";
import { getUserGamificationStats } from "./userStatsUtil";

export async function getUserStatsHandler(req: Request, res: Response): Promise<void> {
	try {
		const supabase = req.supabase!;
		const userId = req.user!.id;

		const stats = await getUserGamificationStats(supabase, userId);

		res.status(200).json({
			success: true,
			stats: {
				total_orders: stats.totalOrders,
				current_streak: stats.currentStreak,
				longest_streak: stats.longestStreak,
				account_age_days: stats.accountAgeDays
			}
		});
	} catch (error: any) {
		console.error("Get user stats error:", error);
		res.status(500).json({ error: error.message || "Internal server error" });
	}
}