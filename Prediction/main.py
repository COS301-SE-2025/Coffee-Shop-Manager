from collections import Counter, defaultdict
from datetime import datetime
from typing import List, Dict, Any, Optional


def group_time_of_day(hour: int) -> str:
    """Return morning/afternoon/evening based on hour."""
    if 5 <= hour < 12:
        return "morning"
    elif 12 <= hour < 18:
        return "afternoon"
    else:
        return "evening"


def predict_order(orders: List[Dict[str, Any]], now: Optional[datetime] = None) -> Dict[str, Any]:
    """
    Predict recommended products based on frequency, time, and weekday.
    
    Each order dict must have: product_id, quantity, created_at (ISO string)
    """
    if not orders:
        return {"suggestions": [], "reasoning": "No history available"}

    overall_counts = Counter()
    tod_counts = defaultdict(Counter)
    weekday_counts = defaultdict(Counter)

    for order in orders:
        product = order["product_id"]
        qty = order.get("quantity", 1)
        created_at = datetime.fromisoformat(order["created_at"])

        overall_counts[product] += qty
        tod_counts[group_time_of_day(created_at.hour)][product] += qty
        weekday_counts[created_at.weekday()][product] += qty

    now = now or datetime.now()
    tod = group_time_of_day(now.hour)
    weekday = now.weekday()

    # Step 1: Try weekday preference
    if weekday_counts[weekday]:
        top_items = weekday_counts[weekday].most_common()
        max_count = top_items[0][1]
        weekday_choices = [p for p, c in top_items if c == max_count]
        if weekday_choices:
            return {
                "suggestions": weekday_choices,
                "reasoning": f"Frequently ordered on {now.strftime('%A')}"
            }

    # Step 2: Try time-of-day preference
    if tod_counts[tod]:
        top_items = tod_counts[tod].most_common()
        max_count = top_items[0][1]
        tod_choices = [p for p, c in top_items if c == max_count]
        if tod_choices:
            return {
                "suggestions": tod_choices,
                "reasoning": f"Favourite choice in the {tod}"
            }

    # Step 3: Fall back to all-time favourites
    top_items = overall_counts.most_common()
    max_count = top_items[0][1]
    overall_choices = [p for p, c in top_items if c == max_count]

    return {
        "suggestions": overall_choices,
        "reasoning": "All-time favourite(s)"
    }

def weather_to_drink_category(weather: dict) -> str:
    """
    Map weather conditions to drink categories.
    Categories: 'hot', 'cold', 'neutral'
    """
    temp = weather.get("temperature")
    code = weather.get("weathercode")

    # Temperature logic
    if temp is not None:
        if temp >= 28:
            return "cold" # Cold option
        elif temp <= 12:
            return "hot" # Hot beverage option

    # Weather condition logic
    if code in [61, 63, 65, 80, 81, 82]:  # rain
        return "hot" # Cold option
    elif code in [0, 1]:
        return "cold" # Hot beverage option

    return "neutral"

CATEGORY_TO_PRODUCTS = {
    "hot": ["cappuccino", "americano", "hot chocolate"],
    "cold": ["iced latte", "frappuccino", "iced tea"],
    "neutral": ["latte", "flat white"],
}

def recommend_from_weather(weather: dict) -> list[str]:
    category = weather_to_drink_category(weather)
    return CATEGORY_TO_PRODUCTS.get(category, [])
