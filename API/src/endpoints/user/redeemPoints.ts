// src/endpoints/loyalty/redeemPoints.ts
import { Request, Response } from "express";
import { supabase } from "../../supabase/client";

export async function redeemLoyaltyPointsHandler(req: Request, res: Response): Promise<void> {
    try {
        // Use user_id from body if provided (barista mode), otherwise fallback to authenticated user
        const authUserId = (req as any).user?.id;
        const { user_id: targetUserId, points, description } = req.body;

        const userId = targetUserId || authUserId;

        if (!userId || !points || points <= 0) {
            res.status(400).json({ error: "Missing userId or invalid points" });
            return;
        }

        // 1. Get current loyalty points
        const { data: profile, error: profileError } = await supabase
            .from("user_profiles")
            .select("loyalty_points")
            .eq("user_id", userId)
            .single();

        if (profileError || !profile) {
            res.status(404).json({ error: "User profile not found" });
            return;
        }

        if (profile.loyalty_points < points) {
            res.status(400).json({ error: "Not enough loyalty points" });
            return;
        }

        // 2. Insert into loyalty_points (log redemption)
        const { error: insertError } = await supabase
            .from("loyalty_points")
            .insert({
                user_id: userId,
                points: -points, // store as negative
                type: "redeem",
                description: description || "Points redeemed"
            });

        if (insertError) {
            res.status(500).json({ error: "Failed to log redemption" });
            return;
        }

        // 3. Update user profile balance
        const { error: updateError } = await supabase
            .from("user_profiles")
            .update({ loyalty_points: profile.loyalty_points - points })
            .eq("user_id", userId);

        if (updateError) {
            res.status(500).json({ error: "Failed to update loyalty balance" });
            return;
        }

        res.status(200).json({
            success: true,
            message: `Redeemed ${points} loyalty points for user ${userId}`,
            remaining_points: profile.loyalty_points - points
        });

    } catch (error: any) {
        console.error("Redeem loyalty points error:", error);
        res.status(500).json({ error: error.message || "Internal server error" });
    }
}
