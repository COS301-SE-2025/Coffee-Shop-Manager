import { BadgeDefinition, badgeDefinitions } from "./badges";

export function evaluateOrderBadges(totalOrders: number): string[] {
    return badgeDefinitions
        .filter(b => b.type === "orders" && b.threshold !== undefined && totalOrders >= b.threshold)
        .map(b => b.id);
}

export function evaluateStreakBadges(longestStreak: number): string[] {
    return badgeDefinitions
        .filter(b => b.type === "streak" && b.threshold !== undefined && longestStreak >= b.threshold)
        .map(b => b.id);
}

export function evaluateAccountAgeBadges(accountAgeDays: number): string[] {
    return badgeDefinitions
        .filter(b => b.type === "account_age" && b.threshold !== undefined && accountAgeDays >= b.threshold)
        .map(b => b.id);
}

export function evaluateSpecialBadges(orders: any[]): string[] {
    const specialBadges: string[] = [];

    const hasNightOwl = orders.some(o => {
        const hour = new Date(o.created_at).getHours();
        return hour >= 0 && hour < 5; // midnight to 5am
    });

    if (hasNightOwl) specialBadges.push("night_owl");

    return specialBadges;
}

export function evaluateAllBadges(
    totalOrders: number,
    longestStreak: number,
    accountAgeDays: number,
    orders: any[]
): string[] {
    return [
        ...evaluateOrderBadges(totalOrders),
        ...evaluateStreakBadges(longestStreak),
        ...evaluateAccountAgeBadges(accountAgeDays),
        ...evaluateSpecialBadges(orders)
    ];
}
