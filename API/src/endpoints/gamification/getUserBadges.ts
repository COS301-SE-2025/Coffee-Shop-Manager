import { Request, Response } from "express";
import { evaluateAllBadges } from "./evaluateBadges";
import { getUserGamificationStats } from "./userStatsUtil";

export async function getUserBadgesHandler(req: Request, res: Response): Promise<void> {
	try {
		const supabase = req.supabase!;
		const userId = req.user!.id;

		const stats = await getUserGamificationStats(supabase, userId);

		const badges = evaluateAllBadges(
			stats.totalOrders,
			stats.longestStreak,
			stats.accountAgeDays,
			stats.orders
		);

		res.status(200).json({
			success: true,
			badges
		});
	} catch (error: any) {
		console.error("Get user badges error:", error);
		res.status(500).json({ error: error.message || "Internal server error" });
	}
}