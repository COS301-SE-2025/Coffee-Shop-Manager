import { Request, Response } from "express";

export async function updateOrderStatusHandler(
	req: Request,
	res: Response,
): Promise<void> {
	try {
		const supabase = req.supabase!;

		const { order_id, status } = req.body;

		if (!order_id || typeof status !== "string") {
			res
				.status(400)
				.json({ success: false, message: "Missing order_id or status" });
			return;
		}

		const validStatuses = ["pending", "completed", "cancelled"];
		if (!validStatuses.includes(status)) {
			res.status(400).json({ success: false, message: "Invalid status" });
			return;
		}

		const { data, error } = await supabase
			.from("orders")
			.update({ status })
			.eq("id", order_id)
			.select("*")
			.maybeSingle();

		if (error) {
			console.error("Supabase update error:", error);
			res.status(500).json({ success: false, message: error.message });
			return;
		}

		if (!data) {
			res.status(404).json({ success: false, message: "Order not found" });
			return;
		}

		// Success response
		res.status(200).json({
			success: true,
			message: `Order ${order_id} updated to ${status}`,
			order: data,
		});
	} catch (err: any) {
		console.error("Unexpected error updating order status:", err);
		res.status(500).json({ success: false, message: "Internal server error" });
	}
}
