import { Request, Response } from "express";
import { supabase } from "../supabase/client";

export async function getProductsHandler(req: Request, res: Response): Promise<void> {
    try {
        const { data, error } = await supabase
            .from("products")
            .select("*");

        if (error) throw error;

        res.status(200).json(data);
    } catch (err: any) {
        console.error("Error fetching products:", err);
        res.status(500).json({ error: err.message || "Internal server error" });
    }
}

interface ProductStockRow {
    product_id: string;
    quantity: number;
    stock: {
        id: string;
        item: string;
        unit_type: string;
    };
}

export async function getProductsWithStockHandler(req: Request, res: Response): Promise<void> {
    try {
        const { data: products, error: productError } = await supabase
            .from("products")
            .select("*");

        if (productError) throw productError;

        const { data: productStock, error: stockError } = await supabase
            .from("product_stock")
            .select("product_id, quantity, stock:stock_id(id, item, unit_type)") as {
                data: ProductStockRow[] | null;
                error: any;
            };

        if (stockError) throw stockError;

        // Build ingredient map
        const ingredientMap: Record<string, any[]> = {};
        if (productStock) {
            for (const ps of productStock) {
                if (!ingredientMap[ps.product_id]) ingredientMap[ps.product_id] = [];
                ingredientMap[ps.product_id].push({
                    stock_id: ps.stock.id,
                    item: ps.stock.item,
                    unit_type: ps.stock.unit_type,
                    quantity: ps.quantity
                });
            }
        }

        // Merge ingredients into products
        const enrichedProducts = products.map(prod => ({
            ...prod,
            ingredients: ingredientMap[prod.id] || []
        }));

        res.status(200).json(enrichedProducts);
    } catch (err: any) {
        console.error("Error fetching detailed products:", err);
        res.status(500).json({ error: err.message || "Internal server error" });
    }
}
