import { Request, Response } from "express";
import { supabase } from "../supabase/client";

export async function getStockHandler(
	req: Request,
	res: Response,
): Promise<void> {
	try {
		const userId = (req as any).user?.id;
		if (!userId) {
			res.status(401).json({ error: "Unauthorized" });
			return;
		}

		const stockId = req.params.id; // retrieve the ID from route params

		let query = supabase
			.from("stock")
			.select("id, item, quantity, unit_type, max_capacity, reserved_quantity");

		if (stockId) {
			// fetch single item if ID is provided
			const { data, error } = await query.eq("id", stockId).single();

			if (error) {
				if (error.code === "PGRST116") { // not found
					res.status(404).json({ error: "Stock item not found" });
					return;
				}
				throw error;
			}

			const percentage_left =
				data.max_capacity && data.max_capacity > 0
					? (Number(data.quantity) / Number(data.max_capacity)) * 100
					: 100;

			res.status(200).json({
				success: true,
				stock: {
					...data,
					percentage_left: Math.round(percentage_left * 100) / 100
				},
			});
			return;
		}

		// Fetch all items if no ID provided
		const { data: stockItems, error } = await query.order("item", { ascending: true });

		if (error) throw error;

		const stockWithPercentage = stockItems.map((stock) => {
			const percentage_left =
				stock.max_capacity && stock.max_capacity > 0
					? (Number(stock.quantity) / Number(stock.max_capacity)) * 100
					: 100;

			return {
				...stock,
				percentage_left: Math.round(percentage_left * 100) / 100
			};
		});

		res.status(200).json({ success: true, stock: stockWithPercentage });
	} catch (error: any) {
		console.error("Get stock error:", error);
		res.status(500).json({ error: error.message || "Internal server error" });
	}
}
