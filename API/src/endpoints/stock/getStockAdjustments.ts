import { Request, Response } from "express";
import { supabase } from "../../supabase/client";

export async function getStockAdjustmentsHandler(
	req: Request,
	res: Response
): Promise<void> {
	try {
		const { stockId, referenceType, limit = 100, offset = 0 } = req.query;

		let query = supabase
			.from("stock_adjustments")
			.select("*")
			.order("created_at", { ascending: false })
			.range(Number(offset), Number(offset) + Number(limit) - 1);

		if (stockId) {
			query = query.eq("stock_id", stockId);
		}

		if (referenceType) {
			query = query.eq("reference_type", referenceType);
		}

		const { data, error } = await query;

		if (error) {
			res.status(500).json({ success: false, error: error.message });
			return;
		}

		res.status(200).json({ success: true, data });
	} catch (err: any) {
		console.error("Get stock adjustments error:", err);
		res.status(500).json({ success: false, error: err.message || "Internal server error" });
	}
}
