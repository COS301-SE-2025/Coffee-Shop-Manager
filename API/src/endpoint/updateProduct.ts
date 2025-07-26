import { Request, Response } from "express";
import { supabase } from "../supabase/client";

export async function updateProductHandler(req: Request, res: Response): Promise<void> {
    try {
        const { product, updates, ingredients } = req.body;

        if (!product) {
            res.status(400).json({ error: "Product name or ID is required." });
            return;
        }

        // 1. Resolve product ID
        let productId: string | null = null;
        if (isUUID(product)) {
            productId = product;
        } else {
            const { data: found, error: findError } = await supabase
                .from("products")
                .select("id")
                .eq("name", product)
                .single();

            if (findError || !found) {
                res.status(404).json({ error: "Product not found" });
                return;
            }
            productId = found.id;
        }

        // 2. Update products table if updates provided
        if (updates && Object.keys(updates).length > 0) {
            const { error: updateError } = await supabase
                .from("products")
                .update(updates)
                .eq("id", productId);

            if (updateError) throw updateError;
        }

        // 3. Update product_stock (ingredients)
        if (Array.isArray(ingredients)) {
            // Delete old mapping
            const { error: deleteError } = await supabase
                .from("product_stock")
                .delete()
                .eq("product_id", productId);

            if (deleteError) throw deleteError;

            // Resolve stock items (by name or ID)
            const stockNames = ingredients
                .map((i) => i.stock_item)
                .filter((s) => s && !isUUID(s));
            const stockIds = ingredients
                .map((i) => i.stock_item)
                .filter((s) => isUUID(s));

            const { data: stockData, error: stockError } = await supabase
                .from("stock")
                .select("id, item")
                .or([
                    stockNames.length ? `item.in.(${stockNames.map((s) => `"${s}"`).join(",")})` : "",
                    stockIds.length ? `id.in.(${stockIds.join(",")})` : "",
                ].filter(Boolean).join(","));

            if (stockError) throw stockError;

            const stockMap: Record<string, string> = {};
                stockData?.forEach((s) => {
                stockMap[s.item] = s.id;
                stockMap[s.id] = s.id;
            });

            // Build new product_stock rows
            const productStockRows = ingredients.map((i) => ({
                product_id: productId!,
                stock_id: stockMap[i.stock_item],
                quantity: i.quantity,
            }));

            const { error: insertError } = await supabase
                .from("product_stock")
                .insert(productStockRows);

            if (insertError) throw insertError;
        }

        res.status(200).json({ success: true, message: "Product updated successfully" });
    } catch (err: any) {
        console.error("Update product error:", err);
        res.status(500).json({ error: err.message || "Internal server error" });
    }
}

// Check UUID format
function isUUID(value: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
}
