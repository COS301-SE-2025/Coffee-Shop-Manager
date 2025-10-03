import { Request, Response } from "express";

type CreateEntry = {
	item: string;
	quantity: number;
	unit_type: string;
	max_capacity?: number;
};

export async function createStockHandler(
	req: Request,
	res: Response,
): Promise<void> {
	try {
		const supabase = req.supabase!;
		const { item, quantity, unit_type, max_capacity }: CreateEntry = req.body;

		// Basic validation
		if (!item || quantity === undefined || !unit_type) {
			res.status(400).json({ error: "Missing required fields" });
			return;
		}

		// Check if item already exists
		const { data: existingItem, error: checkError } = await supabase
			.from("stock")
			.select("id")
			.eq("item", item)
			.single();

		if (existingItem && !checkError) {
			res.status(409).json({ error: "Item already exists" });
			return;
		}

		const newStock: Record<string, any> = { item, quantity, unit_type };
		if (max_capacity !== undefined) newStock.max_capacity = max_capacity;

		const { error: insertError } = await supabase
			.from("stock")
			.insert([newStock]);

		if (insertError) {
			res.status(500).json({ error: insertError.message });
			return;
		}

		res.status(201).json({
			success: true,
			createdItem: item,
		});
	} catch (error: any) {
		console.error("Create stock error:", error);
		res.status(500).json({ error: error.message || "Internal server error" });
	}
}