import { Request, Response } from "express";
import { supabase } from "../../supabase/client";

export async function getOrdersHandler(req: Request, res: Response): Promise<void> {
	try {
		const userId = (req as any).user?.id;
		if (!userId) {
			res.status(401).json({ error: "Unauthorized" });
			return;
		}

		const { filters, orderBy, orderDirection, offset, limit, start_Date, end_Date } = req.body || {};

		// Base query
		let query = supabase.from("orders").select(
			`id,
		status,
		total_price,
		created_at,
		updated_at,
		order_number,
		order_products (
			quantity,
			price,
			product_id,
			products:product_id (
				name,
				description,
				price
			)
		),
		payments (
			id,
			method,
			amount,
			status,
			transaction_id,
			created_at
		)`);

		// Apply filters if provided
		if (filters && typeof filters === "object") {
			for (const [key, value] of Object.entries(filters)) {
				if (value !== undefined && value !== null) {
					query = query.eq(key, value);
				}
			}
		}

		// Apply date range filter
		if (start_Date && end_Date) {
			query = query
				.gte("created_at", new Date(start_Date).toISOString())
				.lt("created_at", new Date(new Date(end_Date).setDate(new Date(end_Date).getDate() + 1)).toISOString());
		} else if (start_Date) {
			query = query.gte("created_at", new Date(start_Date).toISOString());
		} else if (end_Date) {
			query = query.lt("created_at", new Date(new Date(end_Date).setDate(new Date(end_Date).getDate() + 1)).toISOString());
		}



		// Apply ordering if provided
		if (orderBy) {
			query = query.order(orderBy, { ascending: orderDirection !== "desc" });
		} else {
			query = query.order("created_at", { ascending: true });
		}

		if (typeof limit === "number" || typeof offset === "number") {
			const defaultOffset = offset ?? 0;
			const defaultLimit = limit ?? 10;
			query = query.range(defaultOffset, defaultOffset + defaultLimit - 1);
		}

		const { data, error } = await query;

		if (error) throw error;



		const numberedOrders = data.map((data, index) => ({
			...data,
			number: index + 1,
		}));



		// --extra for Admin Dash

		//getting total order count
		let countQuery = supabase.from("orders").select("id", { count: "exact", head: true });
		const { count, error: countError } = await countQuery;
		if (countError) throw countError;

		//get count orders per filter
		let filteredCountQuery = supabase
			.from("orders")
			.select("id", { count: "exact", head: true });

		// Apply filters (status, etc.)
		if (filters && typeof filters === "object") {
			for (const [key, value] of Object.entries(filters)) {
				if (value !== undefined && value !== null) {
					filteredCountQuery = filteredCountQuery.eq(key, value);
				}
			}
		}

		// Apply date range
		if (start_Date && end_Date) {
			filteredCountQuery = filteredCountQuery
				.gte("created_at", new Date(start_Date).toISOString())
				.lt(
					"created_at",
					new Date(
						new Date(end_Date).setDate(new Date(end_Date).getDate() + 1)
					).toISOString()
				);
		} else if (start_Date) {
			filteredCountQuery = filteredCountQuery.gte(
				"created_at",
				new Date(start_Date).toISOString()
			);
		} else if (end_Date) {
			filteredCountQuery = filteredCountQuery.lt(
				"created_at",
				new Date(new Date(end_Date).setDate(new Date(end_Date).getDate() + 1)).toISOString()
			);
		}

		const { count: filteredOrders, error: filteredCountError } =
			await filteredCountQuery;
		if (filteredCountError) throw filteredCountError;



		const today = new Date().toISOString().split("T")[0];



		const { data: topProducts, error: topError } = await supabase.rpc(
			"get_top_selling_products",
			{
				limit_count: 1, start_date: start_Date || today,
				end_date: end_Date || today,
			} // top 5 by default
		);
		if (topError) throw topError;

		const statusForSum =
			filters && filters.status ? filters.status : "pending";



		const { data: sumFiltered, error: sumFilteredError } =
			await supabase.rpc("get_total_sales_by_status", {
				order_status: statusForSum,
				start_date: start_Date || today,
				end_date: end_Date || today,
			});

		if (sumFilteredError) throw sumFilteredError;

		// --extra for Admin Dash



		res.status(200).json({ sucess: true, orders: numberedOrders, count, filteredOrders, topProducts, sumFiltered });
	} catch (error: any) {
		console.error("Get orders error:", error);
		res.status(500).json({ error: error.message || "Internal server error" });
	}
}
