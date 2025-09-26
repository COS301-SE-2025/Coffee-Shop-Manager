export type BadgeType = "orders" | "streak" | "account_age" | "special";

export interface BadgeDefinition {
    id: string;
    name: string;
    type: BadgeType;
    threshold?: number;
}

export const badgeDefinitions: BadgeDefinition[] = [
    // Orders
    { id: "first_order", name: "First Order", type: "orders", threshold: 1 },
    { id: "five_orders", name: "5 Orders", type: "orders", threshold: 5 },
    { id: "ten_orders", name: "10 Orders", type: "orders", threshold: 10 },

    // Streaks
    { id: "three_day_streak", name: "3 Day Streak", type: "streak", threshold: 3 },
    { id: "seven_day_streak", name: "7 Day Streak", type: "streak", threshold: 7 },

    // Account age
    { id: "week_member", name: "1 Week Member", type: "account_age", threshold: 7 },
    { id: "month_member", name: "1 Month Member", type: "account_age", threshold: 30 },
    { id: "year_member", name: "1 Year Member", type: "account_age", threshold: 365 },
];
