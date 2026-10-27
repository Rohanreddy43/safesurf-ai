import socket
import httpx
from typing import Dict, Any, List

async def analyze_hosting(hostname: str) -> Dict[str, Any]:
    ip_address = "Unknown"
    country = "Unknown"
    country_code = "US"
    city = "Unknown"
    asn = "Unknown"
    isp = "Unknown"
    lat = 37.751
    lon = -122.42
    flags: List[str] = []

    try:
        ip_address = socket.gethostbyname(hostname)
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.get(f"http://ip-api.com/json/{ip_address}")
            if resp.status_code == 200:
                data = resp.json()
                if data.get("status") == "success":
                    country = data.get("country", "Unknown")
                    country_code = data.get("countryCode", "US")
                    city = data.get("city", "Unknown")
                    isp = data.get("isp", "Unknown")
                    asn = data.get("as", "Unknown")
                    lat = data.get("lat", 37.751)
                    lon = data.get("lon", -122.42)
    except Exception:
        flags.append("Failed to resolve IP or hosting location details")

    return {
        "ip_address": ip_address,
        "country": country,
        "country_code": country_code,
        "city": city,
        "isp": isp,
        "asn": asn,
        "latitude": lat,
        "longitude": lon,
        "flags": flags
    }
