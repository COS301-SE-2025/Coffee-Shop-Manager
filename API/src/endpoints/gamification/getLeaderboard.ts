import { Request, Response } from "express";
import { supabase } from "../../supabase/client";

export async function getLeaderboardHandler(req: Request, res: Response): Promise<void> {
    try {
        const { limit = 10 } = req.query;

        // Aggregate total completed orders per user
        const { data, error } = await supabase
            .from("leaderboard_total_orders")
            .select("*")
            .limit(Number(limit));


        if (error) throw error;

        res.status(200).json({
            success: true,
            leaderboard: data
        });
    } catch (error: any) {
        console.error("Get leaderboard error:", error);
        res.status(500).json({ error: error.message || "Internal server error" });
    }
}
