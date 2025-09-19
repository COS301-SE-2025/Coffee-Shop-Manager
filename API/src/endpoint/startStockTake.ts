import { Request, Response } from "express";
import { supabase } from "../supabase/client";

export async function startStockTakeHandler(
	req: Request,
	res: Response
): Promise<void> {
	try {
		const userId = (req as any).user?.id;
		if (!userId) {
			res.status(401).json({ error: "Unauthorized" });
			return;
		}

		// Call the database function to start a stock take
		const { data: stockTake, error } = await supabase
			.rpc("start_stock_take", { p_created_by: userId });

		if (error) {
			if (error.message.includes("already in progress")) {
				// If the function enforces only one active stock take
				res.status(400).json({ error: "A stock take is already in progress" });
			} else {
				res.status(500).json({ error: error.message });
			}
			return;
		}

		res.status(201).json({
			success: true,
			stockTake,
		});
	} catch (err: any) {
		console.error("Start stock take error:", err);
		res.status(500).json({ error: err.message || "Internal server error" });
	}
}
