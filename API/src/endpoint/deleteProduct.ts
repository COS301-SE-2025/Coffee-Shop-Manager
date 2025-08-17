import { Request, Response } from "express";
import { supabase } from "../supabase/client";

export async function deleteProductHandler(req: Request, res: Response): Promise<void> {
  const productId = req.params.id;

  if (!productId) {
    res.status(400).json({ success: false, message: "Product ID is required" });
    return;
  }

  try {
    // Delete product_stock item
    const { error: stockError } = await supabase
      .from("product_stock")
      .delete()
      .eq("product_id", productId);

    if (stockError) throw stockError;

    // delete product
    const { data: deletedProduct, error: productError } = await supabase
      .from("products")
      .delete()
      .eq("id", productId)
      .select()
      .maybeSingle();

    if (productError) throw productError;

    if (!deletedProduct) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Product ${productId} deleted successfully`,
      product: deletedProduct
    });

  } catch (err: any) {
    console.error("Delete product error:", err);
    res.status(500).json({ success: false, message: err.message || "Internal server error" });
  }
}
