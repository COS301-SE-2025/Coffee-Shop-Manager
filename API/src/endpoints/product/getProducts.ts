import { Request, Response } from "express";

export async function getProductsHandler(
	req: Request,
	res: Response,
): Promise<void> {
	const supabase = req.supabase!;
	const productId = req.params.id;

	try {
		// if Id specified return only that product, else all products
		const { data, error } = productId
			? await supabase
					.from("products")
					.select("*")
					.eq("id", productId)
					.maybeSingle()
			: await supabase.from("products").select("*");

		if (error) throw error;

		if (productId) {
			// Return single object or null
			res.status(200).json({
				success: true,
				product: data || null,
			});
		} else {
			// Return array of products
			res.status(200).json({
				success: true,
				products: data || [],
			});
		}
	} catch (err: any) {
		console.error("Error fetching products:", err);
		res.status(500).json({ error: err.message || "Internal server error" });
	}
}

interface ProductStockRow {
	product_id: string;
	quantity: number;
	stock: {
		id: string;
		item: string;
		unit_type: string;
	};
}

export async function getProductsWithStockHandler(
	req: Request,
	res: Response,
): Promise<void> {
	const supabase = req.supabase!;
	const productId = req.params.id;

	try {
		// get product(s)
		const { data: products, error: productError } = productId
			? await supabase
					.from("products")
					.select("*")
					.eq("id", productId)
					.maybeSingle()
			: await supabase.from("products").select("*");

		if (productError) throw productError;

		const productsArray = productId
			? products
				? [products]
				: []
			: products || [];

		// get stock items
		const { data: productStock, error: stockError } = (await supabase
			.from("product_stock")
			.select("product_id, quantity, stock:stock_id(id, item, unit_type)")) as {
			data: ProductStockRow[] | null;
			error: any;
		};

		if (stockError) throw stockError;

		// Build ingredient map
		const ingredientMap: Record<string, any[]> = {};
		if (productStock) {
			for (const ps of productStock) {
				if (productId && ps.product_id !== productId) continue;
				if (!ingredientMap[ps.product_id]) ingredientMap[ps.product_id] = [];
				ingredientMap[ps.product_id].push({
					stock_id: ps.stock.id,
					item: ps.stock.item,
					unit_type: ps.stock.unit_type,
					quantity: ps.quantity,
				});
			}
		}

		// Merge ingredients into products
		const enrichedProducts = productsArray.map((prod: any) => ({
			...prod,
			ingredients: ingredientMap[prod.id] || [],
		}));

		res.status(200).json({
			success: true,
			products: productId ? enrichedProducts[0] ? [enrichedProducts[0]] : [] : enrichedProducts,
    	});
	} catch (err: any) {
		console.error("Error fetching detailed products:", err);
		res.status(500).json({ error: err.message || "Internal server error" });
	}
}