import { Request, Response } from "express";
import { supabase } from "../../supabase/client";

export async function getUserStatsHandler(req: Request, res: Response): Promise<void> {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        // Fetch user info for account age
        const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
        if (authError) throw authError;

        const accountCreated = new Date(authUser.user.created_at);
        const today = new Date();
        const accountAgeDays = Math.floor(
            (today.getTime() - accountCreated.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Fetch only completed orders
        const { data: orders, error: ordersError } = await supabase
            .from("orders")
            .select("created_at, status")
            .eq("user_id", userId)
            .eq("status", "completed")
            .order("created_at", { ascending: true });

        if (ordersError) throw ordersError;

        const totalOrders = orders.length;

        // Extract unique days with completed orders
        const uniqueDays = new Set(
            orders.map(order => new Date(order.created_at).toISOString().split("T")[0])
        );

        const sortedDays = Array.from(uniqueDays)
            .map(dateStr => new Date(dateStr))
            .sort((a, b) => a.getTime() - b.getTime());

        let longestStreak = 0;
        let currentStreak = 0;
        let prevDate: Date | null = null;

        for (const date of sortedDays) {
            if (prevDate) {
                const diffDays = Math.floor(
                    (date.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
                );
                if (diffDays === 1) {
                    currentStreak += 1;
                } else {
                    currentStreak = 1; // reset streak
                }
            } else {
                currentStreak = 1; // first day
            }
            longestStreak = Math.max(longestStreak, currentStreak);
            prevDate = date;
        }

        // Check if the streak is still "current"
        let actualCurrentStreak = 0;
        if (sortedDays.length > 0) {
            const lastOrderDate = sortedDays[sortedDays.length - 1];
            const diffFromToday = Math.floor(
                (today.getTime() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24)
            );
            if (diffFromToday === 0 || diffFromToday === 1) {
                actualCurrentStreak = currentStreak;
            } else {
                actualCurrentStreak = 0; // streak ended
            }
        }

        res.status(200).json({
            success: true,
            stats: {
                total_orders: totalOrders,
                current_streak: actualCurrentStreak,
                longest_streak: longestStreak,
                account_age_days: accountAgeDays
            }
        });
    } catch (error: any) {
        console.error("Get user stats error:", error);
        res.status(500).json({ error: error.message || "Internal server error" });
    }
}
