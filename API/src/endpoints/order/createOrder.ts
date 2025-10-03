import { Request, Response } from "express";

interface ProductInput {
    product: string; // name or id
    quantity: number;
}

export async function createOrderHandler(req: Request, res: Response): Promise<void> {
    try {
		const supabase = req.supabase!;

        const { email, products, custom }: { email?: string; products: ProductInput[]; custom?: any } = req.body;

        // Determine user ID
        let userId: string | undefined;
        if (email) {
            const { data: userProfile, error: profileError } = await supabase
                .from("user_profiles")
                .select("user_id")
                .ilike("email", email.trim())
                .single();

            if (profileError || !userProfile) {
                res.status(404).json({ error: "User not found with provided email" });
                return;
            }
            userId = userProfile.user_id;
        } else {
            userId = req.user!.id;
            if (!userId) {
                res.status(401).json({ error: "Unauthorized" });
                return;
            }
        }

        // Validate products
        if (!products || !Array.isArray(products) || products.length === 0) {
            res.status(400).json({ error: "Products list is required" });
            return;
        }
        for (const p of products) {
            if (!p.product || !p.quantity || p.quantity <= 0) {
                res.status(400).json({
                    error: "Each product must have a name or ID and a valid quantity",
                });
                return;
            }
        }

        // Resolve product IDs
        const { data: allProducts, error: productFetchError } = await supabase
            .from("products")
            .select("id, name");
        if (productFetchError || !allProducts) throw productFetchError;

        const resolvedProducts = products.map((p) => {
            const match = allProducts.find(
                (prod: { id: string; name: string }) => prod.id === p.product || prod.name === p.product
            );
            if (!match) throw new Error(`Product not found: ${p.product}`);
            return { ...p, product_id: match.id };
        });

        // Create order
        const { data: order, error: orderError } = await supabase
            .from("orders")
            .insert([{ user_id: userId, custom }])
            .select("id")
            .single();
        if (orderError || !order) throw orderError;

        // Build order_products insert array (no price)
        const orderProductsToInsert: {
            order_id: string;
            product_id: string;
            quantity: number;
        }[] = [];

        for (const p of resolvedProducts) {
            orderProductsToInsert.push({
                order_id: order.id,
                product_id: p.product_id,
                quantity: p.quantity,
            });
        }

        // Insert order_products (price will be set by trigger)
        const { error: insertOrderError } = await supabase
            .from("order_products")
            .insert(orderProductsToInsert);
        if (insertOrderError) throw insertOrderError;

        res.status(201).json({
            success: true,
            order_id: order.id,
            message: email
                ? `Order created for ${email}`
                : "Order created",
        });
    } catch (err: any) {
        console.error("Order creation failed:", err);
        res.status(500).json({ error: err.message || "Internal server error" });
    }
}