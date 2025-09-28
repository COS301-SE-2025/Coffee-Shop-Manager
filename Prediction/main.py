from collections import Counter
from datetime import datetime
from typing import Dict, Any, Optional
import requests
import json
import sys


class CoffeeRecommendationEngine:
    """A streamlined coffee recommendation system based on order history and weather."""

    # Weather code mappings from Open-Meteo API
    WEATHER_CODES = {
        0: "clear_sky", 1: "mainly_clear", 2: "partly_cloudy", 3: "overcast",
        45: "fog", 48: "depositing_rime_fog",
        51: "light_drizzle", 53: "moderate_drizzle", 55: "dense_drizzle",
        56: "light_freezing_drizzle", 57: "dense_freezing_drizzle",
        61: "slight_rain", 63: "moderate_rain", 65: "heavy_rain",
        66: "light_freezing_rain", 67: "heavy_freezing_rain",
        71: "slight_snow", 73: "moderate_snow", 75: "heavy_snow",
        77: "snow_grains", 80: "slight_rain_showers", 81: "moderate_rain_showers",
        82: "violent_rain_showers", 85: "slight_snow_showers", 86: "heavy_snow_showers",
        95: "thunderstorm", 96: "thunderstorm_with_hail", 99: "thunderstorm_with_heavy_hail"
    }

    # Product categorization for weather-based recommendations
    WEATHER_PREFERENCES = {
        "hot": ["cappuccino", "americano", "hot_chocolate", "chai_latte", "mocha"],
        "cold": ["iced_latte", "frappuccino", "iced_tea", "cold_brew", "iced_americano"],
        "comfort": ["latte", "flat_white", "macchiato", "espresso"]  # neutral/comfort drinks
    }

    def __init__(self):
        self.order_history = []

    def add_orders(self, orders_data: Dict[str, Any]) -> None:
        """Add order data from the input format."""
        self.order_history = []
        for order in orders_data.get("data", []):
            for product in order.get("order_products", []):
                self.order_history.append({
                    "product_id": product["product_id"],
                    "quantity": product["quantity"],
                    "created_at": order["created_at"],
                    "user_id": order["user_id"]
                })

    @staticmethod
    def get_weather(lat: float, lon: float) -> Dict[str, Any]:
        """Fetch current weather data."""
        url = (
            f"https://api.open-meteo.com/v1/forecast"
            f"?latitude={lat}&longitude={lon}"
            f"&current_weather=true"
        )
        try:
            resp = requests.get(url, timeout=10)
            resp.raise_for_status()
            data = resp.json()
            current = data.get("current_weather", {})
            return {
                "temperature": current.get("temperature"),
                "windspeed": current.get("windspeed"),
                "weathercode": current.get("weathercode"),
                "time": current.get("time"),
            }
        except requests.RequestException as e:
            print(f"Weather API error: {e}")
            return {}

    @staticmethod
    def get_time_period(hour: int) -> str:
        """Categorize hour into time periods."""
        if 5 <= hour < 12:
            return "morning"
        elif 12 <= hour < 17:
            return "afternoon"
        elif 17 <= hour < 21:
            return "evening"
        else:
            return "night"

    def get_weather_preference(self, weather: Dict[str, Any]) -> str:
        """Determine drink preference category based on weather."""
        temp = weather.get("temperature")
        code = weather.get("weathercode", 0)

        # Temperature-based logic
        if temp is not None:
            if temp >= 25:  # Hot day
                return "cold"
            elif temp <= 10:  # Cold day
                return "hot"
            elif temp <= 15:  # Cool day
                return "comfort"

        # Weather condition logic
        rainy_codes = {51, 53, 55, 61, 63, 65, 66, 67, 80, 81, 82}
        cold_codes = {71, 73, 75, 77, 85, 86, 56, 57}
        stormy_codes = {95, 96, 99}

        if code in rainy_codes or code in stormy_codes:
            return "hot"  # Comfort drinks for bad weather
        elif code in cold_codes:
            return "hot"
        elif code in {0, 1}:  # Clear/sunny
            return "cold" if temp and temp > 20 else "comfort"

        return "comfort"  # Default

    def analyze_patterns(self, target_time: Optional[datetime] = None) -> Dict[str, Counter]:
        """Analyze order patterns by time and weekday."""
        if not self.order_history:
            return {"overall": Counter(), "time_period": Counter(), "weekday": Counter()}

        target_time = target_time or datetime.now()

        overall_counts = Counter()
        time_period_counts = Counter()
        weekday_counts = Counter()

        target_period = self.get_time_period(target_time.hour)
        target_weekday = target_time.weekday()

        for order in self.order_history:
            product_id = order["product_id"]
            quantity = order.get("quantity", 1)
            order_time = datetime.fromisoformat(order["created_at"])

            overall_counts[product_id] += quantity

            # Count for matching time periods
            if self.get_time_period(order_time.hour) == target_period:
                time_period_counts[product_id] += quantity

            # Count for matching weekdays
            if order_time.weekday() == target_weekday:
                weekday_counts[product_id] += quantity

        return {
            "overall": overall_counts,
            "time_period": time_period_counts,
            "weekday": weekday_counts
        }

    def get_recommendations(self,
                          lat: Optional[float] = None,
                          lon: Optional[float] = None,
                          target_time: Optional[datetime] = None,
                          max_suggestions: int = 3) -> Dict[str, Any]:
        """
        Get personalized drink recommendations based on history and weather.
        
        Args:
            lat: Latitude for weather data
            lon: Longitude for weather data  
            target_time: Time to predict for (defaults to now)
            max_suggestions: Maximum number of suggestions to return
            
        Returns:
            Dictionary with suggestions, scores, and reasoning
        """
        target_time = target_time or datetime.now()

        # Get weather data if coordinates provided
        weather = {}
        weather_products = []
        if lat is not None and lon is not None:
            weather = self.get_weather(lat, lon)
            if weather:
                weather_pref = self.get_weather_preference(weather)
                weather_products = self.WEATHER_PREFERENCES.get(weather_pref, [])

        # Analyze historical patterns
        patterns = self.analyze_patterns(target_time)

        if not any(patterns.values()):
            # No history available, fall back to weather only
            if weather_products:
                return {
                    "suggestions": weather_products[:max_suggestions],
                    "reasoning": "Weather-based recommendation (no history available)",
                    "weather": weather,
                    "confidence": "low"
                }
            return {
                "suggestions": ["cappuccino", "latte"],  # Default suggestions
                "reasoning": "Default recommendations (no history or weather data)",
                "confidence": "very_low"
            }

        # Calculate weighted scores
        candidate_products = set()
        candidate_products.update(patterns["overall"].keys())
        candidate_products.update(weather_products)

        scores = {}
        reasoning_parts = []

        for product in candidate_products:
            score = 0

            # Historical preference weights
            weekday_score = patterns["weekday"].get(product, 0)
            time_score = patterns["time_period"].get(product, 0)
            overall_score = patterns["overall"].get(product, 0)

            # Normalize historical scores
            max_weekday = max(patterns["weekday"].values()) if patterns["weekday"] else 1
            max_time = max(patterns["time_period"].values()) if patterns["time_period"] else 1
            max_overall = max(patterns["overall"].values()) if patterns["overall"] else 1

            weekday_norm = weekday_score / max_weekday if max_weekday > 0 else 0
            time_norm = time_score / max_time if max_time > 0 else 0
            overall_norm = overall_score / max_overall if max_overall > 0 else 0

            # Weighted combination
            if weekday_score > 0:
                score += 0.4 * weekday_norm  # Strongest signal: same weekday preference
                if not reasoning_parts or "weekday" not in " ".join(reasoning_parts):
                    reasoning_parts.append("weekday preference")

            if time_score > 0:
                score += 0.3 * time_norm  # Time of day preference
                if not reasoning_parts or "time" not in " ".join(reasoning_parts):
                    reasoning_parts.append("time preference")

            score += 0.2 * overall_norm  # Overall frequency

            # Weather boost
            if product in weather_products:
                score += 0.1  # Small weather boost
                if "weather" not in " ".join(reasoning_parts):
                    reasoning_parts.append("weather conditions")

            if score > 0:
                scores[product] = score

        if not scores:
            return {
                "suggestions": weather_products[:max_suggestions] if weather_products else ["cappuccino"],
                "reasoning": "Fallback recommendation",
                "confidence": "low"
            }

        # Get top recommendations
        sorted_products = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        top_suggestions = [prod for prod, _ in sorted_products[:max_suggestions]]

        # Determine confidence level
        top_score = sorted_products[0][1]
        if top_score >= 0.6:
            confidence = "high"
        elif top_score >= 0.3:
            confidence = "medium"
        else:
            confidence = "low"

        return {
            "suggestions": top_suggestions,
            "scores": {prod: round(score, 3) for prod, score in sorted_products[:max_suggestions]},
            "reasoning": f"Based on {', '.join(reasoning_parts)}",
            "confidence": confidence,
            "weather": weather,
            "target_time": target_time.strftime("%Y-%m-%d %H:%M"),
            "weekday": target_time.strftime("%A"),
            "time_period": self.get_time_period(target_time.hour)
        }


def main():
    InputData = {
        "data": [
            {
                "id": 101,
                "user_id": "user-123", 
                "status": "done",
                "total_price": 75.00,
                "created_at": "2025-09-15T08:15:00",
                "updated_at": "2025-09-15T08:20:00",
                "order_products": [
                    {"product_id": "cappuccino", "quantity": 2, "price": 50.00},
                    {"product_id": "cafe_latte", "quantity": 1, "price": 25.00}
                ]
            },
            {
                "id": 102,
                "user_id": "user-123",
                "status": "done", 
                "total_price": 30.00,
                "created_at": "2025-09-16T14:10:00",
                "updated_at": "2025-09-16T14:12:00",
                "order_products": [
                    {"product_id": "cappuccino", "quantity": 1, "price": 30.00}
                ]
            },
            {
                "id": 103,
                "user_id": "user-123",
                "status": "done",
                "total_price": 45.00, 
                "created_at": "2025-09-17T19:30:00",
                "updated_at": "2025-09-17T19:35:00",
                "order_products": [
                    {"product_id": "espresso", "quantity": 3, "price": 45.00}
                ]
            }
        ]
    }

    engine = CoffeeRecommendationEngine()
    engine.add_orders(InputData)

    recommendations = engine.get_recommendations(
        # UP
        lat=-25.75294229798473,
        lon=28.231851245426416,
        target_time=datetime(2025, 9, 18, 8, 30)
    )

    # print("Recommendations:", recommendations)
    print(json.dumps(recommendations))
    return recommendations

def main_cli():
    if len(sys.argv) < 5:
        print(json.dumps({"error": "Missing arguments"}))
        sys.exit(1)
    user_id = sys.argv[1]
    lat = float(sys.argv[2])
    lon = float(sys.argv[3])
    use_json = "--json" in sys.argv

    if use_json:
        # Read JSON from stdin
        input_json = sys.stdin.read()
        try:
            InputData = json.loads(input_json)
        except Exception as e:
            print(json.dumps({"error": f"Invalid JSON input: {str(e)}"}))
            sys.exit(1)
    else:
        # fallback to hardcoded data
        InputData = {
            "data": [
                # ...existing sample data...
            ]
        }

    engine = CoffeeRecommendationEngine()
    engine.add_orders(InputData)
    recommendations = engine.get_recommendations(lat=lat, lon=lon)
    print(json.dumps(recommendations))

if __name__ == "__main__":
    if len(sys.argv) > 1:
        main_cli()
    else:
        main()

# if __name__ == "__main__":
    # main()
