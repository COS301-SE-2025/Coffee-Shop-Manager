import { Request, Response } from "express";
import { supabase } from "../supabase/client";

interface StockItemInput {
  item: string;
  quantity: number;
}

interface CreateProductInput {
  name: string;
  description?: string;
  price: number;
  stock_quantity: number;
  stock_items?: StockItemInput[];
}

export async function createProductHandler(req: Request, res: Response): Promise<void> {
  try {
    const { name, description, price, stock_quantity, stock_items }: CreateProductInput = req.body;

    if (!name || price == null || stock_quantity == null) {
      res.status(400).json({ error: "Name, price, and stock_quantity are required" });
      return;
    }

    // 1. Insert product
    const { data: productData, error: productError } = await supabase
      .from("products")
      .insert([{ name, description, price, stock_quantity }])
      .select("id")
      .single();

    if (productError) throw productError;

    const productId = productData.id;

    // 2. If stock items provided -> resolve and insert into product_stock
    if (stock_items && stock_items.length > 0) {
      const stockNames = stock_items.map(si => si.item);

      // Fetch stock IDs (accept item name or id)
      const { data: stockData, error: stockFetchError } = await supabase
        .from("stock")
        .select("id, item")
        .in("item", stockNames);

      if (stockFetchError) throw stockFetchError;

      if (!stockData || stockData.length < stock_items.length) {
        const foundItems = stockData.map(s => s.item);
        const missing = stockNames.filter(n => !foundItems.includes(n));
        res.status(400).json({ error: `Stock items not found: ${missing.join(", ")}` });
        return;
      }

      const stockMap = Object.fromEntries(stockData.map(s => [s.item, s.id]));

      const productStockRows = stock_items.map(si => ({
        product_id: productId,
        stock_id: stockMap[si.item],
        quantity: si.quantity
      }));

      const { error: productStockError } = await supabase
        .from("product_stock")
        .insert(productStockRows);

      if (productStockError) throw productStockError;
    }

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product_id: productId
    });

  } catch (error: any) {
    console.error("Create product error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
