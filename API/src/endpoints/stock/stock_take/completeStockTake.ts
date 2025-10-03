import { Request, Response } from "express";

export async function completeStockTakeHandler(
	req: Request,
	res: Response
): Promise<void> {
	try {
		const supabase = req.supabase!;
		const userId = req.user!.id;

		let { stockTakeId }: { stockTakeId?: string } = req.body ?? {};

		// Fetch active stock take if no ID provided
		if (!stockTakeId) {
			const { data: activeStockTake, error: fetchError } = await supabase
				.from("stock_take")
				.select("id")
				.eq("status", "inprogress")
				.single();

			if (fetchError || !activeStockTake) {
				res.status(400).json({ error: "No active stock take found" });
				return;
			}

			stockTakeId = activeStockTake.id;
		}

		// Call the database function to complete the stock take
		const { error } = await supabase.rpc("complete_stock_take", {
			p_stock_take_id: stockTakeId,
			p_completed_by: userId,
		});

		if (error) {
			res.status(400).json({ success: false, error: error.message });
			return;
		}

		res.status(200).json({ success: true, stockTake: stockTakeId });
	} catch (err: any) {
		console.error("Complete stock take error:", err);
		res.status(500).json({ error: err.message || "Internal server error" });
	}
}
