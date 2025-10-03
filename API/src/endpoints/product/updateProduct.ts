import { Request, Response } from "express";

export async function updateProductHandler(
	req: Request,
	res: Response,
): Promise<void> {
	try {
		const supabase = req.supabase!;

		const { product, updates, ingredients } = req.body;

		if (!product) {
			res.status(400).json({ error: "Product name or ID is required." });
			return;
		}

		// Get product
		let productId: string | null = null;
		if (isUUID(product)) {
			const { data: found, error } = await supabase
				.from("products")
				.select("id")
				.eq("id", product)
				.maybeSingle();

			if (error || !found) {
				res.status(404).json({ error: "Product not found" });
				return;
			}
			productId = product;
		} else {
			const { data: found, error: findError } = await supabase
				.from("products")
				.select("id")
				.eq("name", product)
				.maybeSingle();

			if (findError || !found) {
				res.status(404).json({ error: "Product not found" });
				return;
			}
			productId = found.id;
		}

		// Update products table if updates provided
		let updatedProduct = null;
		if (updates && Object.keys(updates).length > 0) {
			const { data, error } = await supabase
				.from("products")
				.update(updates)
				.eq("id", productId)
				.select("*")
				.maybeSingle();

			if (error) throw error;
			updatedProduct = data;
		}

		// Update product_stock (ingredients)
		const missingStockItems: string[] = [];
		if (Array.isArray(ingredients)) {
			// Resolve stock items (by name or ID)
			const stockNames = ingredients
				.map((i) => i.stock_item)
				.filter((s) => s && !isUUID(s));
			const stockIds = ingredients
				.map((i) => i.stock_item)
				.filter((s) => isUUID(s));

			const { data: stockData, error: stockError } = await supabase
				.from("stock")
				.select("id, item")
				.or(
					[
						stockNames.length
							? `item.in.(${stockNames.map((s) => `"${s}"`).join(",")})`
							: "",
						stockIds.length ? `id.in.(${stockIds.join(",")})` : "",
					]
						.filter(Boolean)
						.join(","),
				);

			if (stockError) throw stockError;

			const stockMap: Record<string, { id: string; item: string }> = {};
			stockData?.forEach(
				(s) => (stockMap[s.item] = { id: s.id, item: s.item }),
			);
			stockData?.forEach((s) => (stockMap[s.id] = { id: s.id, item: s.item }));

			// Update stock if it exists, add if it doesnt
			for (const i of ingredients) {
				const stockEntry =
					stockMap[i.stock_item.toLowerCase()?.trim()] ||
					stockMap[i.stock_item];
				if (!stockEntry) {
					missingStockItems.push(i.stock_item);
					continue;
				}

				const stock_id = stockEntry.id;

				// If quantity 0 Remove the ingredient
				if (i.quantity === 0) {
					const { error: deleteError } = await supabase
						.from("product_stock")
						.delete()
						.eq("product_id", productId)
						.eq("stock_id", stock_id);

					if (deleteError) throw deleteError;
				} else {
					const { error: upsertError } = await supabase
						.from("product_stock")
						.upsert(
							[
								{
									product_id: productId!,
									stock_id: stock_id,
									quantity: i.quantity,
								},
							],
							{ onConflict: "product_id,stock_id" },
						)
						.select("*");

					if (upsertError) throw upsertError;
				}
			}
		}

		// Fetch all ingredients for this product with names
		const { data: finalIngredients } = await supabase
			.from("product_stock")
			.select("*, stock(item)")
			.eq("product_id", productId);

		const responseBody: any = {
			success: true,
			message: "Product updated successfully",
			product: updatedProduct,
			ingredients: finalIngredients,
		};

		// Only include list if it contains something
		if (missingStockItems.length > 0) {
			responseBody.missingStockItems = missingStockItems;
		}

		res.status(200).json(responseBody);
	} catch (err: any) {
		console.error("Update product error:", err);
		res.status(500).json({ error: err.message || "Internal server error" });
	}
}

// Check UUID format
function isUUID(value: string): boolean {
	const uuidRegex =
		/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
	return uuidRegex.test(value);
}
