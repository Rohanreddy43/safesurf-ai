import re
import urllib.parse
from typing import Dict, Any, List
from bs4 import BeautifulSoup

TARGET_BRANDS = {
    "paypal": ["paypal", "pay-pal", "payp1", "palpay", "pypl"],
    "microsoft": ["microsoft", "office365", "outlook", "msft", "live-login", "azure"],
    "google": ["google", "gsuite", "gmail", "accounts-google", "g-drive"],
    "apple": ["apple", "icloud", "appleid", "itunes", "apple-support"],
    "chase": ["chase", "chase-bank", "chaseonline", "jp-morgan"],
    "amazon": ["amazon", "amzn", "aws-login", "prime-video"],
    "netflix": ["netflix", "net-flix", "nflx"],
    "meta": ["facebook", "instagram", "whatsapp", "meta-login"],
    "binance": ["binance", "binance-us", "bnb-chain"],
    "coinbase": ["coinbase", "coinbase-pro", "cb-wallet"],
    "bankofamerica": ["bankofamerica", "bofa", "bank-of-america"]
}

def analyze_visual_similarity(url: str, html_content: str = "") -> Dict[str, Any]:
    """
    Visual Similarity Engine
    Compares page DOM features, titles, favicons, logos, and keywords against legitimate brands.
    """
    parsed = urllib.parse.urlparse(url)
    domain_lower = parsed.netloc.lower()
    
    match_found = False
    matched_brand = None
    similarity_score = 0
    reasons = []

    if html_content:
        soup = BeautifulSoup(html_content, "html.parser")
        page_title = (soup.title.string if soup.title and soup.title.string else "").lower()
        
        # Extract favicon / logo images
        logos = []
        for img in soup.find_all("img", src=True):
            src = img["src"].lower()
            alt = img.get("alt", "").lower()
            if any(k in src or k in alt for k in ["logo", "brand", "header"]):
                logos.append(src)

        # Check each target brand
        for brand, keywords in TARGET_BRANDS.items():
            # If domain IS the official brand, skip (not phishing)
            if domain_lower == f"{brand}.com" or domain_lower.endswith(f".{brand}.com"):
                continue

            brand_matches = 0

            # Title matches official brand
            if brand in page_title:
                brand_matches += 40
                reasons.append(f"Page title contains target brand '{brand.capitalize()}'")

            # Domain contains keyword/typo of brand
            for kw in keywords:
                if kw in domain_lower:
                    brand_matches += 50
                    reasons.append(f"Domain string '{parsed.netloc}' closely matches brand keyword '{kw}'")

            # Check logos/images for brand keyword
            for logo_src in logos:
                if brand in logo_src:
                    brand_matches += 30
                    reasons.append(f"Extracted image asset references brand '{brand.capitalize()}'")

            if brand_matches > similarity_score:
                similarity_score = min(brand_matches, 99)
                matched_brand = brand.capitalize()
                match_found = True

    return {
        "status": "completed",
        "is_cloned_brand": match_found and similarity_score >= 40,
        "matched_brand": matched_brand if (match_found and similarity_score >= 40) else None,
        "similarity_score": similarity_score,
        "detection_reasons": reasons,
        "inspected_targets_count": len(TARGET_BRANDS)
    }
