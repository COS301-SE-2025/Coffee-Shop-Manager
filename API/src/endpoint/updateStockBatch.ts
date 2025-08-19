import { Request, Response } from "express";
import { supabase } from "../supabase/client";

type UpdateEntry = {
  id?: string;
  item?: string;
  fields: Partial<{
    quantity: number;
    unit_type: string;
    max_capacity: number;
    reserved_quantity: number;
  }>;
};

export async function batchUpdateStockHandler(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const updates: UpdateEntry[] = req.body;
    if (!Array.isArray(updates)) {
      res.status(400).json({ error: "Request body must be an array" });
      return;
    }

    const updatedItems: string[] = [];
    const failedItems: { idOrItem: string; reason: string }[] = [];

    for (const update of updates) {
      const identifier = update.id
        ? { id: update.id }
        : update.item
          ? { item: update.item }
          : null;
      if (!identifier) {
        failedItems.push({ idOrItem: "unknown", reason: "Missing id or item" });
        continue;
      }

      const identifierValue = update.id ?? update.item ?? "unknown";

      const { data: existing, error: fetchError } = await supabase
        .from("stock")
        .select("id, item")
        .match(identifier)
        .single();

      if (!existing || fetchError) {
        failedItems.push({
          idOrItem: identifierValue,
          reason: `Item with identifier '${identifierValue}' not found`,
        });
        continue;
      }

      const { error: updateError } = await supabase
        .from("stock")
        .update(update.fields)
        .match(identifier);

      if (updateError) {
        failedItems.push({
          idOrItem: existing.item,
          reason: updateError.message,
        });
        continue;
      }

      updatedItems.push(existing.item);
    }

    res.status(200).json({
      success: true,
      updatedItems,
      failedItems: failedItems.length > 0 ? failedItems : undefined,
    });
  } catch (error: any) {
    console.error("Batch update error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
