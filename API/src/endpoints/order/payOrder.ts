import { Request, Response } from "express";

export async function updateOrderPaidStatusHandler(
	req: Request,
	res: Response,
): Promise<void> {
	try {
		const supabase = req.supabase!;

		const { id } = req.params;

		if (!id) {
			res.status(400).json({ success: false, message: "Missing order ID" });
			return;
		}

		const { data, error } = await supabase
			.from("orders")
			.update({ paid_status: "paid" })
			.eq("id", id)
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

		res.status(200).json({
			success: true,
			message: `Order ${id} marked as paid`,
			order: data,
		});
	} catch (err: any) {
		console.error("Unexpected error updating order paid_status:", err);
		res.status(500).json({ success: false, message: "Internal server error" });
	}
}
