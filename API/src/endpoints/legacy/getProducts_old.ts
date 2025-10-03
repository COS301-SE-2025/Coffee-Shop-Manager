import { Request, Response } from "express";

export async function getProductsHandler_old(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const supabase = (req as any).supabase;

    const { data: products, error } = await supabase
      .from("products")
      .select("id, name, description, price, stock_quantity")
      .order("name", { ascending: true });

    if (error) {
      throw error;
    }

    res.status(200).json({ success: true, products });
  } catch (error: any) {
    console.error("Get products error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}