import urllib.parse
from typing import Dict, Any, List
import requests

LEGITIMACY_PATHS = [
    "/robots.txt", "/sitemap.xml", "/privacy", "/terms",
    "/about", "/contact", "/help", "/faq"
]

def analyze_site_legitimacy(url: str, html_content: str = "") -> Dict[str, Any]:
    """
    Site Structure & Legitimacy Audit Engine
    Verifies robots.txt, sitemap.xml, privacy policy, and multi-page business indicators vs 1-page phishing kits.
    """
    parsed = urllib.parse.urlparse(url)
    domain = parsed.netloc.lower()
    scheme = parsed.scheme or "https"

    found_assets = {}
    total_found = 0

    # Probe key business assets concurrently / in loop
    for path in LEGITIMACY_PATHS[:4]:
        check_url = f"{scheme}://{domain}{path}"
        try:
            resp = requests.head(check_url, timeout=2.0, headers={"User-Agent": "Mozilla/5.0 (SafeSurfBot/1.0)"})
            if resp.status_code in [200, 301, 302]:
                found_assets[path] = True
                total_found += 1
            else:
                found_assets[path] = False
        except Exception:
            found_assets[path] = False

    has_robots = found_assets.get("/robots.txt", False)
    has_sitemap = found_assets.get("/sitemap.xml", False)
    has_privacy = found_assets.get("/privacy", False)

    # Score calculation (0 to 100)
    legitimacy_score = 30 + (total_found * 15)
    if has_robots:
        legitimacy_score += 15
    if has_sitemap:
        legitimacy_score += 15

    legitimacy_score = min(legitimacy_score, 100)
    
    is_isolated_phishing_kit = total_found == 0 and len(html_content) < 15000

    return {
        "status": "completed",
        "legitimacy_score": legitimacy_score,
        "has_robots_txt": has_robots,
        "has_sitemap_xml": has_sitemap,
        "has_privacy_policy": has_privacy,
        "probed_assets": found_assets,
        "is_isolated_phishing_kit": is_isolated_phishing_kit,
        "classification": "Established Multi-Page Site" if legitimacy_score >= 60 else ("Minimal Single-Page Application" if legitimacy_score >= 35 else "Isolated Phishing Kit Signature")
    }
