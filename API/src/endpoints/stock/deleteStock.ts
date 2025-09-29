import { Request, Response } from "express";
import { supabase } from "../../supabase/client";

export async function deleteStockHandler(
	req: Request,
	res: Response,
): Promise<void> {
	try {
		const { id } = req.params;

		if (!id) {
			res.status(400).json({ error: "Stock ID is required" });
			return;
		}

		// Delete the stock item
		const { data, error } = await supabase
			.from("stock")
			.delete()
			.eq("id", id)
			.select();

		if (error) {
			console.error("Delete stock error:", error);
			res.status(500).json({ error: error.message });
			return;
		}

		if (!data || data.length === 0) {
			res.status(404).json({ error: "Stock item not found" });
			return;
		}

		res.status(200).json({
			success: true,
			deletedItem: data[0],
		});
	} catch (error: any) {
		console.error("Delete stock error:", error);
		res.status(500).json({ error: error.message || "Internal server error" });
	}
}
