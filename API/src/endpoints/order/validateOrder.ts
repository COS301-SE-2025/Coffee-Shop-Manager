import { Request, Response } from "express";

interface ProductInput {
    product: string; // id or name
    quantity: number;
}

export async function validateOrderHandler(req: Request, res: Response): Promise<void> {
    try {
        const supabase = req.supabase!;
        const { products }: { products: ProductInput[] } = req.body || {};

        if (!products || !Array.isArray(products) || products.length === 0) {
            res.status(400).json({ error: "Products list is required" });
            return;
        }

        // Resolve product IDs
        const { data: allProducts, error: productFetchError } = await supabase
            .from("products")
            .select("id, name");
        if (productFetchError || !allProducts) throw productFetchError;

        const resolved = products.map((p) => {
            const match = allProducts.find((prod: any) => prod.id === p.product || prod.name === p.product);
            if (!match) throw new Error(`Product not found: ${p.product}`);
            return { ...p, product_id: match.id };
        });

        const productIds = Array.from(new Set(resolved.map((r) => r.product_id)));

        // Fetch product_stock rows for involved products
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

        // Build maps
        const usageMap: Record<string, { [stockId: string]: number }> = {}; // product_id -> {stockId: qtyNeededPerProduct}
        for (const ps of productStock || []) {
            if (!usageMap[ps.product_id]) usageMap[ps.product_id] = {};
            usageMap[ps.product_id][ps.stock_id] = Number(ps.quantity || 0);
        }

        const stockQtyMap: Record<string, number> = {};
        for (const s of stocks || []) stockQtyMap[s.id] = Number(s.quantity || 0);

        // Initialize allowed quantities from requested quantities.
        // Validation is driven by product_stock (ingredients) and stock (available amounts).
        const allowed: Record<string, number> = {};
        for (const r of resolved) {
            allowed[r.product_id] = Math.max(0, Math.floor(r.quantity));
        }

        // Enforce stock constraints using greedy decrement per-stock
        // For each stock, if total need exceeds available, repeatedly decrement the product
        // contributing the most (needPerUnit * allowed) until constraint satisfied.
        for (const stockId of Object.keys(stockQtyMap)) {
            let stockQty = stockQtyMap[stockId] ?? 0;
            // Build users list for this stock
            const users = Object.keys(allowed)
                .map((pid) => ({ pid, needPerUnit: usageMap[pid]?.[stockId] || 0 }))
                .filter((u) => u.needPerUnit > 0);

            // Compute total need
            let totalNeed = users.reduce((sum, u) => sum + allowed[u.pid] * u.needPerUnit, 0);
            // While overdrawn, decrement the pid with largest contribution
            while (totalNeed > stockQty) {
                // Find pid with max contribution needPerUnit * allowed
                let worst: { pid: string; contrib: number } | null = null;
                for (const u of users) {
                    const contrib = u.needPerUnit * (allowed[u.pid] || 0);
                    if (!worst || contrib > worst.contrib) worst = { pid: u.pid, contrib };
                }
                if (!worst) break; // nothing to reduce
                // If worst product already zero, break to avoid infinite loop
                if ((allowed[worst.pid] || 0) <= 0) break;
                // decrement by 1 unit
                allowed[worst.pid] = Math.max(0, (allowed[worst.pid] || 0) - 1);
                // recompute totalNeed
                totalNeed = users.reduce((sum, u) => sum + allowed[u.pid] * u.needPerUnit, 0);
            }
        }

        // Build result mapping back to requested products order
        const result = resolved.map((r) => ({ product: r.product, product_id: r.product_id, requested: r.quantity, allowed: allowed[r.product_id] ?? 0 }));
        const allOk = result.every((r) => r.allowed >= r.requested);

        res.status(200).json({ success: true, allOk, adjustments: result });
    } catch (err: any) {
        console.error("Validate order failed:", err);
        res.status(500).json({ error: err.message || "Internal server error" });
    }
}
