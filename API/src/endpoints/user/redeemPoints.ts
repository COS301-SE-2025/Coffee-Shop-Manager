// src/endpoints/loyalty/redeemPoints.ts
import { Request, Response } from "express";
import { supabase } from "../../supabase/client";

export async function redeemLoyaltyPointsHandler(req: Request, res: Response): Promise<void> {
  try {
    const authUserId = (req as any).user?.id;
    const { user_id: targetUserId, email, points, description } = req.body;

    if (!points || points <= 0) {
      res.status(400).json({ error: "Invalid points value" });
      return;
    }

    let userId: string | undefined = targetUserId;

    // If email is provided, fetch user ID from Supabase Auth
    if (email && !userId) {
        const { data: users, error: userError } = await supabase.auth.admin.listUsers();
        if (userError) throw userError;

        const matchedUser = users.users.find((u) => u.email === email);
        if (!matchedUser) {
            res.status(404).json({ error: "User not found with provided email" });
            return;
        }
        userId = matchedUser.id;
    }

    // Fall back to authenticated user if no target specified
    if (!userId) {
      if (!authUserId) {
        res.status(401).json({ error: "Unauthorized: no user specified" });
        return;
      }
      userId = authUserId;
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
        points: -points,
        type: "redeem",
        description: description || "Points redeemed",
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
      remaining_points: profile.loyalty_points - points,
    });

  } catch (error: any) {
    console.error("Redeem loyalty points error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
