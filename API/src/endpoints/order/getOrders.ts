import { Request, Response } from "express";
import { supabase } from "../../supabase/client";

export async function getOrdersHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { filters, orderBy, orderDirection } = req.body || {};

    // Base query
    let query = supabase.from("orders").select("*");

    // Apply filters if provided
    if (filters && typeof filters === "object") {
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      }
    }

    // Apply ordering if provided
    if (orderBy) {
      query = query.order(orderBy, { ascending: orderDirection !== "desc" });
    }

    const { data, error } = await query;

    if (error) throw error;

    res.status(200).json(data);
  } catch (error: any) {
    console.error("Get orders error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
