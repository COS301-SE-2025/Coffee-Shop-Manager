import { Request, Response } from "express";

type StockItemInput = {
	item: string; // can be name or id
	quantity: number;
};

export async function saveStockTakeItemsHandler(
	req: Request,
	res: Response
): Promise<void> {
	try {
		const supabase = req.supabase!;
		const userId = req.user!.id;

		const { stockTakeId, items }: { stockTakeId?: string; items: StockItemInput[] } =
			req.body;

		if (!items || !Array.isArray(items) || items.length === 0) {
			res.status(400).json({ error: "Items array is required" });
			return;
		}

		let activeStockTakeId = stockTakeId;

		// If stockTakeId not provided, fetch the active stock take
		if (!activeStockTakeId) {
			const { data: activeStockTake, error: fetchError } = await supabase
				.from("stock_take")
				.select("id")
				.eq("status", "inprogress")
				.single();

			if (fetchError || !activeStockTake) {
				res.status(400).json({ error: "No active stock take found" });
				return;
			}
			activeStockTakeId = activeStockTake.id;
		}

		const results: Array<{ item: string; action: "updated"; success: boolean; error?: string }> = [];

		for (const item of items) {
			let stockId: string | undefined;

			// Try to resolve stock item by id first
			if (/^[0-9a-fA-F-]{36}$/.test(item.item)) {
				const { data: stockById } = await supabase
					.from("stock")
					.select("id")
					.eq("id", item.item)
					.single();
				if (stockById) stockId = stockById.id;
			}

			// Otherwise, try to resolve by name
			if (!stockId) {
				const { data: stockByName } = await supabase
					.from("stock")
					.select("id")
					.eq("item", item.item)
					.single();
				if (stockByName) stockId = stockByName.id;
			}

			if (!stockId) {
				results.push({ item: item.item, action: "updated", success: false, error: "Item not found" });
				continue;
			}

			// Update existing row
			const { data, error } = await supabase
				.from("stock_take_items")
				.update({ counted_qty: item.quantity })
				.eq("stock_take_id", activeStockTakeId)
				.eq("stock_id", stockId)
				.select()
				.single();

			if (!data) {
				results.push({
					item: item.item,
					action: "updated",
					success: false,
					error: "Stock take item does not exist",
				});
				continue;
			}

			results.push({
				item: item.item,
				action: "updated",
				success: !error,
				error: error?.message,
			});
		}

		res.status(200).json({ results });
	} catch (err: any) {
		console.error("Save stock take items error:", err);
		res.status(500).json({ error: err.message || "Internal server error" });
	}
}
