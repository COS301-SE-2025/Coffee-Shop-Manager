import { Request, Response } from "express";

type UpdateEntry = {
	id?: string;
	item?: string;
	fields: Partial<{
		quantity: number;
		unit_type: string;
		max_capacity: number;
		reserved_quantity: number;
	}>;
};

type CreateEntry = {
	item: string;
	quantity: number;
	unit_type: string;
	max_capacity?: number;
	reserved_quantity?: number;
};

export async function updateStockHandler_old(
	req: Request,
	res: Response,
): Promise<void> {
	try {
		const supabase = req.supabase!;

		const {
			updates,
			creates,
		}: { updates?: UpdateEntry[]; creates?: CreateEntry[] } = req.body;

		const updatedItems: string[] = [];
		const createdItems: string[] = [];
		const failedItems: { idOrItem: string; reason: string }[] = [];

		// --- Handle Updates ---
		if (Array.isArray(updates)) {
			for (const update of updates) {
				const identifier = update.id
					? { id: update.id }
					: update.item
						? { item: update.item }
						: null;
				if (!identifier) {
					failedItems.push({
						idOrItem: "unknown",
						reason: "Missing id or item in update",
					});
					continue;
				}

				const { data: existing, error: fetchError } = await supabase
					.from("stock")
					.select("id, item")
					.match(identifier)
					.single();

				if (!existing || fetchError) {
					failedItems.push({
						idOrItem: update.id ?? update.item ?? "unknown",
						reason: "Item not found for update",
					});
					continue;
				}

				const { error: updateError } = await supabase
					.from("stock")
					.update(update.fields)
					.match(identifier);

				if (updateError) {
					failedItems.push({
						idOrItem: existing.item,
						reason: updateError.message,
					});
					continue;
				}

				updatedItems.push(existing.item);
			}
		}

		// --- Handle Creates ---
		if (Array.isArray(creates)) {
			for (const create of creates) {
				if (
					!create.item ||
					create.quantity === undefined ||
					!create.unit_type
				) {
					failedItems.push({
						idOrItem: create.item ?? "unknown",
						reason: "Missing required fields for creation",
					});
					continue;
				}

				// Check if item already exists
				const { data: existingItem, error: checkError } = await supabase
					.from("stock")
					.select("id")
					.eq("item", create.item)
					.single();

				if (existingItem && !checkError) {
					failedItems.push({
						idOrItem: create.item,
						reason: "Item already exists",
					});
					continue;
				}

				const { error: insertError } = await supabase
					.from("stock")
					.insert([create]);

				if (insertError) {
					failedItems.push({
						idOrItem: create.item,
						reason: insertError.message,
					});
					continue;
				}

				createdItems.push(create.item);
			}
		}

		res.status(200).json({
			success: true,
			updatedItems,
			createdItems,
			failedItems: failedItems.length > 0 ? failedItems : undefined,
		});
	} catch (error: any) {
		console.error("Update/Create stock error:", error);
		res.status(500).json({ error: error.message || "Internal server error" });
	}
}
