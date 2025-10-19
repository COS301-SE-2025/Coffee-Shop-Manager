import { Request, Response } from "express";
import { supabaseAdmin } from "../../supabase/client";

supabaseAdmin.auth.admin.listUsers({ perPage: 1 })
  .then(() => console.log('SUPABASE_PRIVATE_KEY appears to be service role (admin calls OK)'))
  .catch(() => console.warn('SUPABASE_PRIVATE_KEY does not appear to be service role — admin calls failed'));


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
			console.error("RedeemPoints: loyalty_points insert error:", insertError);
			res.status(500).json({ error: "Failed to log redemption" });
			return;
		}

		// Use a trusted DB function to perform the upsert under DB privileges
		const { data: rpcResult, error: rpcErr } = await supabaseAdmin.rpc("upsert_payment", {
			p_order_id: order_id,
			p_user_id: userId,
			p_amount: 0,
			p_method: "points",
			p_status: "completed",
			p_transaction_id: null,
		});

		if (rpcErr) {
			console.error("RedeemPoints: upsert_payment RPC error:", rpcErr);
			res.status(500).json({ error: "Failed to log payment via RPC", details: rpcErr.message });
			return;
		}

		console.log("RedeemPoints: upsert_payment RPC succeeded", rpcResult);

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