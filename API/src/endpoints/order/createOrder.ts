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

        // Fetch product_stock rows for involved products
        const productIds = Array.from(new Set(resolvedProducts.map((r) => r.product_id)));
        const { data: productStock, error: psErr } = await supabase
            .from("product_stock")
            .select("product_id, stock_id, quantity")
            .in("product_id", productIds as any[]);
        if (psErr) throw psErr;

        // Fetch stock quantities
        const stockIds = Array.from(new Set((productStock || []).map((ps: any) => ps.stock_id)));
        const { data: stocks, error: stockErr } = await supabase
            .from("stock")
            .select("id, quantity")
            .in("id", stockIds as any[]);
        if (stockErr) throw stockErr;

        const usageMap: Record<string, { [stockId: string]: number }> = {};
        for (const ps of productStock || []) {
            if (!usageMap[ps.product_id]) usageMap[ps.product_id] = {};
            usageMap[ps.product_id][ps.stock_id] = Number(ps.quantity || 0);
        }

        const stockQtyMap: Record<string, number> = {};
        for (const s of stocks || []) stockQtyMap[s.id] = Number(s.quantity || 0);

        // Start with requested quantities
        const allowed: Record<string, number> = {};
        for (const r of resolvedProducts) allowed[r.product_id] = Math.max(0, Math.floor(r.quantity));

        // Enforce stock constraints using greedy decrement per-stock (same algorithm as validator)
        for (const stockId of Object.keys(stockQtyMap)) {
            let stockQty = stockQtyMap[stockId] ?? 0;
            const users = Object.keys(allowed)
                .map((pid) => ({ pid, needPerUnit: usageMap[pid]?.[stockId] || 0 }))
                .filter((u) => u.needPerUnit > 0);

            let totalNeed = users.reduce((sum, u) => sum + allowed[u.pid] * u.needPerUnit, 0);
            while (totalNeed > stockQty) {
                let worst: { pid: string; contrib: number } | null = null;
                for (const u of users) {
                    const contrib = u.needPerUnit * (allowed[u.pid] || 0);
                    if (!worst || contrib > worst.contrib) worst = { pid: u.pid, contrib };
                }
                if (!worst) break;
                if ((allowed[worst.pid] || 0) <= 0) break;
                allowed[worst.pid] = Math.max(0, (allowed[worst.pid] || 0) - 1);
                totalNeed = users.reduce((sum, u) => sum + allowed[u.pid] * u.needPerUnit, 0);
            }
        }

        // Map back and check if any requested > allowed
        const adjustments = resolvedProducts.map((r) => ({ product_id: r.product_id, requested: r.quantity, allowed: allowed[r.product_id] ?? 0 }));
        const allOk = adjustments.every((a) => a.allowed >= a.requested);
        if (!allOk) {
            // Return specific error and do not create order
            const firstBad = adjustments.find((a) => a.allowed < a.requested)!;
            res.status(400).json({ error: `Not enough stock for item ${firstBad.product_id}`, adjustments });
            return;
        }
        // --- end validation ---

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