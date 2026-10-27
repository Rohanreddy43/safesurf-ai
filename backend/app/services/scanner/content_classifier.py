import re
from typing import Dict, Any, List

ADULT_KEYWORDS = [
    "porn", "xxx", "adult", "nsfw", "erotic", "sex", "hentai", "camgirl",
    "xvideos", "pornhub", "strip", "nude", "playboy", "onlyfans", "brazzers"
]

GAMBLING_KEYWORDS = [
    "casino", "betting", "poker", "slots", "jackpot", "sportsbook", "wager",
    "roulette", "baccarat", "gambling", "stake", "1xbet", "bet365", "betway",
    "draftkings", "fanduel", "lottery", "bookmaker"
]

ILLEGAL_KEYWORDS = [
    "torrent", "piratebay", "warez", "crack", "keygen", "nulled", "darknet",
    "cracked-software", "stolen-cards"
]

def analyze_content_category(domain: str, url: str, html_text: str = "") -> Dict[str, Any]:
    categories: List[str] = []
    warnings: List[str] = []

    combined_text = f"{domain} {url} {html_text}".lower()

    is_adult = False
    is_gambling = False
    is_illegal = False

    # 1. Adult Content Detection
    for kw in ADULT_KEYWORDS:
        if kw in combined_text:
            is_adult = True
            categories.append("Adult Content 🔞")
            warnings.append("🔞 Adult / Explicit Content Detected: Contains age-restricted NSFW materials.")
            break

    # 2. Gambling & Betting Site Detection
    for kw in GAMBLING_KEYWORDS:
        if kw in combined_text:
            is_gambling = True
            categories.append("Online Gambling & Betting 🎲")
            warnings.append("🎲 Online Gambling / Betting Site: Contains real-money wagering or casino games.")
            break

    # 3. Piracy & Illegal Material Detection
    for kw in ILLEGAL_KEYWORDS:
        if kw in combined_text:
            is_illegal = True
            categories.append("Piracy / Illegal Downloads ⚠️")
            warnings.append("⚠️ Piracy / Illegal Content: Contains unauthorized software cracks or torrent downloads.")
            break

    primary_category = "General Web"
    if categories:
        primary_category = " / ".join(categories)

    return {
        "is_adult": is_adult,
        "is_gambling": is_gambling,
        "is_illegal": is_illegal,
        "categories": categories,
        "primary_category": primary_category,
        "warnings": warnings
    }
