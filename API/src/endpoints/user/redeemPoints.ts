import { Request, Response } from "express";

export async function redeemLoyaltyPointsHandler(req: Request, res: Response): Promise<void> {
	try {
		const supabase = req.supabase!;
		const authUserId = req.user!.id;
		const { user_id: targetUserId, email, points, description, order_id } = req.body;

		if (!order_id) {
			res.status(400).json({ error: "order_id is required" });
			return;
		}

		if (!points || points <= 0) {
			res.status(400).json({ error: "Invalid points value" });
			return;
		}

		if (email && targetUserId) {
			res.status(400).json({ error: "Provide either user_id or email, not both." });
			return;
		}

		let userId: string | undefined = targetUserId;

		// If email is provided, fetch user ID from user_profiles
		if (email) {
			const { data: profile, error: profileError } = await supabase
				.from("user_profiles")
				.select("user_id")
				.eq("email", email)
				.single();

			if (profileError || !profile) {
				res.status(404).json({ error: "User not found with provided email" });
				return;
			}
			userId = profile.user_id;
		}

		// Fall back to authenticated user if no target specified
		if (!userId) {
			userId = authUserId;
		}

		// 1. Get current loyalty points from user_profiles
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
				order_id: order_id,
			});

		if (insertError) {
			console.log(insertError);
			res.status(500).json({ error: "Failed to log redemption" });
			return;
		}

		// 3. Insert payment record
		const { error: paymentError } = await supabase
			.from("payments")
			.insert({
				order_id: order_id,
				user_id: userId,
				amount: 0,
				method: "points",
				status: "completed",
				transaction_id: null,
			});

		if (paymentError) {
			res.status(500).json({ error: "Failed to log payment" });
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