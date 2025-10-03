import { Request, Response } from "express";

interface StockItemInput {
	item: string;
	quantity: number;
}

interface CreateProductInput {
	name: string;
	description?: string;
	price: number;
	stock_items?: StockItemInput[];
}

export async function createProductHandler(
	req: Request,
	res: Response,
): Promise<void> {
	try {
		const supabase = req.supabase!;

		const {
			name,
			description,
			price,
			stock_items,
		}: CreateProductInput = req.body;

		if (!name || price == null) {
			res
				.status(400)
				.json({ error: "Name and price are required" });
			return;
		}

		// If stock_items provided, check if all exist before inserting product
		let stockMap: Record<string, string> = {};
		if (stock_items && stock_items.length > 0) {
			const stockNames = stock_items.map((si) => si.item);

			const { data: stockData, error: stockFetchError } = await supabase
				.from("stock")
				.select("id, item")
				.in("item", stockNames);

			if (stockFetchError) throw stockFetchError;

			if (!stockData || stockData.length < stock_items.length) {
				const foundItems = stockData ? stockData.map((s) => s.item) : [];
				const missing = stockNames.filter((n) => !foundItems.includes(n));
				res
					.status(400)
					.json({ error: `Stock items not found: ${missing.join(", ")}` });
				return;
			}

			stockMap = Object.fromEntries(stockData.map((s) => [s.item, s.id]));
		}

		// Insert product
		const { data: productData, error: productError } = await supabase
			.from("products")
			.insert([{ name, description, price }])
			.select("id")
			.single();

		if (productError) throw productError;

		const productId = productData.id;

		// If stock items provided, insert into product_stock
		if (stock_items && stock_items.length > 0) {
			const productStockRows = stock_items.map((si) => ({
				product_id: productId,
				stock_id: stockMap[si.item],
				quantity: si.quantity,
			}));

			const { error: productStockError } = await supabase
				.from("product_stock")
				.insert(productStockRows);

			if (productStockError) throw productStockError;
		}

		res.status(201).json({
			success: true,
			message: "Product created successfully",
			product_id: productId,
		});
	} catch (error: any) {
		console.error("Create product error:", error);
		res.status(500).json({ error: error.message || "Internal server error" });
	}
}