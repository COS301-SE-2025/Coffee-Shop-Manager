import { Request, Response } from "express";
import { getAdminClient } from "../../supabase/client";

export async function cancelOrderHandler(req: Request, res: Response): Promise<void> {
    try {
        const supabase = req.supabase!;
        const adminSupabase = getAdminClient();
        
        const { order_id } = req.body;

        if (!order_id) {
            res.status(400).json({ error: "Order ID is required" });
            return;
        }

        // Check if order exists and get its current status
        const { data: orderData, error: fetchError } = await supabase
            .from("orders")
            .select("id, status, user_id")
            .eq("id", order_id)
            .single();

        if (fetchError || !orderData) {
            res.status(404).json({ error: "Order not found" });
            return;
        }

        // Check if order can be cancelled (only pending orders)
        if (orderData.status !== "pending") {
            res.status(400).json({ 
                error: `Cannot cancel order with status: ${orderData.status}`,
                current_status: orderData.status 
            });
            return;
        }

        // Check if user is authorized to cancel this order
        const userId = req.user?.id;
        const isUserOrder = orderData.user_id === userId;
        
        // Check if user has admin role
        const { data: userProfile } = await supabase
            .from("user_profiles")
            .select("role")
            .eq("user_id", userId)
            .single();
        
        const isAdmin = userProfile?.role === "admin";

        if (!isUserOrder && !isAdmin) {
            res.status(403).json({ error: "You are not authorized to cancel this order" });
            return;
        }

        // Use admin client to update order status (bypass RLS)
        const { error: updateError } = await adminSupabase
            .from("orders")
            .update({ 
                status: "cancelled",
                updated_at: new Date().toISOString()
            })
            .eq("id", order_id);

        if (updateError) {
            console.error("Failed to cancel order:", updateError);
            res.status(500).json({ error: "Failed to cancel order" });
            return;
        }

        // The stock refund will be handled by the database trigger
        // (we'll create/update the trigger to handle cancellations)

        res.status(200).json({
            success: true,
            message: "Order cancelled successfully",
            order_id: order_id
        });

    } catch (err: any) {
        console.error("Cancel order error:", err);
        res.status(500).json({ error: err.message || "Internal server error" });
    }
}