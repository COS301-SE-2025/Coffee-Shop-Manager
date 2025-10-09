import { SupabaseClient } from "@supabase/supabase-js";

export interface UserGamificationStats {
	totalOrders: number;
	accountAgeDays: number;
	longestStreak: number;
	currentStreak: number;
	orders: any[];
}

export async function getUserGamificationStats(
	supabase: SupabaseClient,
	userId: string
): Promise<UserGamificationStats> {
	// Fetch user info for account age
	const { data: user, error: userError } = await supabase
		.from("user_profiles")
		.select("created_at")
		.eq("user_id", userId)
		.single();

	if (userError) throw userError;

	const accountCreated = new Date(user.created_at);
	const today = new Date();
	const accountAgeDays = Math.floor(
		(today.getTime() - accountCreated.getTime()) / (1000 * 60 * 60 * 24)
	);

	// Fetch completed orders
	const { data: orders, error: ordersError } = await supabase
		.from("orders")
		.select("created_at, status")
		.eq("user_id", userId)
		.eq("status", "completed")
		.order("created_at", { ascending: true });

	if (ordersError) throw ordersError;

	const totalOrders = orders.length;

	// Calculate streaks
	const uniqueDays = new Set(
		orders.map((order: any) => new Date(order.created_at).toISOString().split("T")[0])
	);

	const sortedDays = Array.from(uniqueDays)
		.map(dateStr => new Date(dateStr))
		.sort((a, b) => a.getTime() - b.getTime());

	let longestStreak = 0;
	let currentStreak = 0;
	let prevDate: Date | null = null;

	for (const date of sortedDays) {
		if (prevDate) {
			const diffDays = Math.floor(
				(date.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
			);
			if (diffDays === 1) {
				currentStreak += 1;
			} else {
				currentStreak = 1;
			}
		} else {
			currentStreak = 1;
		}
		longestStreak = Math.max(longestStreak, currentStreak);
		prevDate = date;
	}

	// Check if the streak is still "current"
	let actualCurrentStreak = 0;
	if (sortedDays.length > 0) {
		const lastOrderDate = sortedDays[sortedDays.length - 1];
		const diffFromToday = Math.floor(
			(today.getTime() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24)
		);
		if (diffFromToday === 0 || diffFromToday === 1) {
			actualCurrentStreak = currentStreak;
		} else {
			actualCurrentStreak = 0;
		}
	}

	return {
		totalOrders,
		accountAgeDays,
		longestStreak,
		currentStreak: actualCurrentStreak,
		orders
	};
}