import requests

def get_weather(lat: float, lon: float) -> dict:
    """
    Fetch current weather for a given latitude and longitude.
    Returns simplified info: temperature (°C), condition.
    """
    url = (
        f"https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat}&longitude={lon}"
        f"&current_weather=true"
    )
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
