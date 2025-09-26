import { Request, Response } from "express";
import { supabase } from "../../supabase/client";

export async function updateStockByIdHandler(
	req: Request,
	res: Response,
): Promise<void> {
	try {
		const userId = (req as any).user?.id;
		if (!userId) {
			res.status(401).json({ error: "Unauthorized" });
			return;
		}

		const { id } = req.params;
		const { reference, ...fields } = req.body;

		if (!id || typeof fields !== "object" || Object.keys(fields).length === 0) {
			res.status(400).json({ error: "Missing ID or update fields" });
			return;
		}

		if (!reference || typeof reference !== "string") {
			res.status(400).json({ error: "Reference reason is required" });
			return;
		}

		const { data: existing, error: fetchError } = await supabase
			.from("stock")
			.select("id, item, quantity")
			.eq("id", id)
			.single();

		if (!existing || fetchError) {
			res.status(404).json({ error: "Item not found" });
			return;
		}

		const { error: updateError } = await supabase
			.from("stock")
			.update(fields)
			.eq("id", id);

		if (updateError) throw updateError;

		if (fields.quantity !== undefined && fields.quantity !== existing.quantity) {
			const adjustmentQty = fields.quantity - existing.quantity;

			const { error: logError } = await supabase
				.from("stock_adjustments")
				.insert({
					stock_id: id,
					adjustment_qty: adjustmentQty,
					reference,
					reference_type: "user",
					reference_id: userId,
				});

			if (logError) throw logError;
		}


		res.status(200).json({ success: true, updatedItem: existing.item });
	} catch (error: any) {
		console.error("Update stock error:", error);
		res.status(500).json({ error: error.message || "Internal server error" });
	}
}
