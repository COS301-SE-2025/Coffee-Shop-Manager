import { Request, Response } from "express";

export async function getProductAvailabilityHandler(req: Request, res: Response): Promise<void> {
    try {
        const supabase = req.supabase!;
        const product_id = req.params.id;

        let data, error;
        if (product_id) {
            // Single product
            ({ data, error } = await supabase
                .rpc("get_product_availability", { p_product_id: product_id }));
        } else {
            // All products
            ({ data, error } = await supabase
                .rpc("get_product_availability", { p_product_id: null }));
        }

        if (error) throw error;

        res.status(200).json({ availability: data });
    } catch (err: any) {
        res.status(500).json({ error: err.message || "Internal server error" });
    }
}