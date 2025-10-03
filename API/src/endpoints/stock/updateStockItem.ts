import { Request, Response } from "express";

export async function updateStockHandler(
	req: Request,
	res: Response,
): Promise<void> {
	try {
		const supabase = req.supabase!;
		const userId = req.user!.id;

		// Prefer id from URL, then from body
		const urlId = req.params.id;
		const { id: bodyId, lookup_item, reference, ...fields } = req.body;

		const id = urlId || bodyId;

		if (!id && !lookup_item) {
			res.status(400).json({ error: "Either id (in URL or body) or lookup_item must be specified" });
			return;
		}

		// Only allow certain fields to be updated
		const allowedFields = ['item', 'quantity', 'unit_type', 'max_capacity'];
		const updateFields = Object.fromEntries(
			Object.entries(fields).filter(([key]) => allowedFields.includes(key))
		);

		if (Object.keys(updateFields).length === 0) {
			res.status(400).json({ error: "No fields to update provided" });
			return;
		}

		// Query for existing item
		let query = supabase.from("stock").select("*");
		if (id) {
			query = query.eq("id", id);
		} else {
			query = query.eq("item", lookup_item);
		}

		const { data: existing, error: fetchError } = await query.single();

		if (!existing || fetchError) {
			res.status(404).json({ error: "Item not found" });
			return;
		}

		// If quantity is being updated, require reference
		if (
			updateFields.quantity !== undefined &&
			updateFields.quantity !== existing.quantity &&
			(!reference || typeof reference !== "string")
		) {
			res.status(400).json({ error: "Reference reason is required when updating quantity" });
			return;
		}

		// Update
		let updateQuery = supabase.from("stock").update(updateFields);
		if (id) {
			updateQuery = updateQuery.eq("id", id);
		} else {
			updateQuery = updateQuery.eq("item", lookup_item);
		}

		const { error: updateError } = await updateQuery;
		if (updateError) throw updateError;

		// Log adjustment if quantity changed
		if (
			typeof updateFields.quantity === "number" &&
			typeof existing.quantity === "number" &&
			updateFields.quantity !== existing.quantity
		) {
			const adjustmentQty = updateFields.quantity - existing.quantity;

			const { error: logError } = await supabase
				.from("stock_adjustments")
				.insert({
					stock_id: existing.id,
					adjustment_qty: adjustmentQty,
					reference,
					reference_type: "user",
					reference_id: userId,
				});

			if (logError) {
				console.error("Adjustment log failed:", logError.message);
			}
		}

		res.status(200).json({ success: true, updatedItem: existing.item });
	} catch (error: any) {
		console.error("Update stock error:", error);
		res.status(500).json({ error: error.message || "Internal server error" });
	}
}