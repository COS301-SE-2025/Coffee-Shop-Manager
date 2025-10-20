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
            return { product_id: match.id, quantity: p.quantity };
        });

        // Use atomic database function to create order with stock validation
        // This ensures the entire operation (order + order_products + stock deduction) is atomic
        const { data: result, error: createError } = await supabase
            .rpc('create_order_atomic', {
                p_user_id: userId,
                p_custom: custom ? JSON.parse(JSON.stringify(custom)) : null,
                p_products: resolvedProducts
            });

        if (createError) {
            console.error("Database function error:", createError);
            throw createError;
        }

        // The function returns a single row with order_id, success, error_message
        const orderResult = result[0];
        
        if (!orderResult.success) {
            // Handle stock insufficiency or other errors from the database function
            if (orderResult.error_message && orderResult.error_message.includes('Not enough stock for item')) {
                // Extract stock ID from error message
                const stockIdMatch = orderResult.error_message.match(/Not enough stock for item ([0-9a-fA-F-]{36})/);
                if (stockIdMatch) {
                    const stockId = stockIdMatch[1];
                    res.status(400).json({ 
                        error: "Not enough stock for item " + stockId,
                        type: "INSUFFICIENT_STOCK",
                        stock_id: stockId
                    });
                    return;
                }
            }
            
            // Handle product not found errors
            if (orderResult.error_message && orderResult.error_message.includes('has no stock requirements defined')) {
                res.status(400).json({ 
                    error: "Product configuration error. Please contact support.",
                    type: "PRODUCT_CONFIG_ERROR"
                });
                return;
            }
            
            // Handle user input validation errors
            if (orderResult.error_message && (
                orderResult.error_message.includes('User ID cannot be null') ||
                orderResult.error_message.includes('Products array cannot be empty')
            )) {
                res.status(400).json({ 
                    error: "Invalid order data. Please try again.",
                    type: "VALIDATION_ERROR"
                });
                return;
            }
            
            // For any other database errors, log the full error but return a generic message
            console.error("Order creation failed with database error:", orderResult.error_message);
            res.status(400).json({ 
                error: "Unable to create order. Please try again.",
                type: "ORDER_CREATION_FAILED"
            });
            return;
        }

        res.status(201).json({
            success: true,
            order_id: orderResult.order_id,
            message: email
                ? `Order created for ${email}`
                : "Order created",
        });
    } catch (err: any) {
        console.error("Order creation failed:", err);
        res.status(500).json({ error: err.message || "Internal server error" });
    }
}