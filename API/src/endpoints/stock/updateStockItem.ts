import { Request, Response } from "express";
import { supabase } from "../../supabase/client";

export async function updateStockByIdOrNameHandler(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { id, item, reference, ...fields } = req.body;

    if (!id && item) {
      delete fields.item;
    }

    if (!id && !item) {
      res.status(400).json({ error: "Either id or item must be specified" });
      return;
    }

    if (Object.keys(fields).length === 0) {
      res.status(400).json({ error: "No fields to update provided" });
      return;
    }

    // Query for existing item
    let query: any = supabase.from("stock").select("id, item, quantity");

    if (id) {
      query = query.eq("id", id).single();
    } else {
      query = query.eq("item", item).single();
    }

    const { data: existing, error: fetchError } = await query;

    if (!existing || fetchError) {
      res.status(404).json({ error: "Item not found" });
      return;
    }

    // Update
    let updateQuery = supabase.from("stock").update(fields);

    if (id) {
      updateQuery = updateQuery.eq("id", id);
    } else {
      updateQuery = updateQuery.eq("item", item);
    }

    const { error: updateError } = await updateQuery;

    if (updateError) throw updateError;

    if (fields.quantity !== undefined && fields.quantity !== existing.quantity) {
      const adjustmentQty = fields.quantity - existing.quantity;

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
