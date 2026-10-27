import re
import urllib.parse
from typing import Dict, Any, List

TARGET_BRANDS = [
    "google", "paypal", "facebook", "apple", "microsoft", "amazon",
    "netflix", "chase", "wellsfargo", "bankofamerica", "binance", "coinbase",
    "dropbox", "github", "twitter", "instagram", "linkedin", "steam", "meta"
]

SUSPICIOUS_TLDS = [
    "tk", "ml", "ga", "cf", "gq", "xyz", "top", "club", "site", "work",
    "click", "link", "zip", "mov", "vip", "icu", "fit", "online", "shop"
]

SUSPICIOUS_KEYWORDS = [
    "login", "verify", "secure", "banking", "update", "account", "auth",
    "checkpoint", "confirm", "credential", "signin", "support", "billing",
    "restore", "wallet", "passcode", "security", "customer", "portal"
]

def levenshtein_distance(s1: str, s2: str) -> int:
    if len(s1) < len(s2):
        return levenshtein_distance(s2, s1)
    if len(s2) == 0:
        return len(s1)
    previous_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row
    return previous_row[-1]

def analyze_url(url: str) -> Dict[str, Any]:
    flags: List[str] = []
    status = "Safe"
    score_impact = 0

    if not url.startswith("http://") and not url.startswith("https://"):
        url = "https://" + url

    parsed = urllib.parse.urlparse(url)
    hostname = (parsed.hostname or "").lower()
    scheme = parsed.scheme.lower()
    path = parsed.path.lower()

    # 1. Scheme Check
    is_https = scheme == "https"
    if not is_https:
        flags.append("Insecure HTTP protocol used (missing HTTPS encryption)")
        score_impact -= 15

    # 2. IP-based URL
    ip_pattern = re.compile(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$")
    is_ip = bool(ip_pattern.match(hostname))
    if is_ip:
        flags.append("URL uses a raw IP address instead of a registered domain")
        score_impact -= 25

    # 3. Homograph / Punycode
    has_punycode = hostname.startswith("xn--") or any(ord(char) > 127 for char in hostname)
    if has_punycode:
        flags.append("Homograph/Unicode attack vector detected (Punycode characters present)")
        score_impact -= 30

    # 4. Domain & Subdomain Extraction
    subdomain_parts = hostname.split(".")
    tld = subdomain_parts[-1] if len(subdomain_parts) >= 1 else ""
    
    if len(subdomain_parts) >= 2:
        apex_domain = f"{subdomain_parts[-2]}.{subdomain_parts[-1]}"
        domain_body = subdomain_parts[-2]
    else:
        apex_domain = hostname
        domain_body = hostname

    subdomain_count = len(subdomain_parts) - 2 if len(subdomain_parts) > 2 else 0
    if subdomain_count >= 2:
        flags.append(f"Excessive subdomains detected ({subdomain_count} levels)")
        score_impact -= 15

    # 5. Suspicious TLD Check
    if tld in SUSPICIOUS_TLDS:
        flags.append(f"High-risk suspicious TLD detected (.{tld}) commonly used by phishing campaigns")
        score_impact -= 25

    # 6. Brand Impersonation & Typosquatting Check
    matched_brand = None
    brand_impersonation_detected = False

    for brand in TARGET_BRANDS:
        # Check if domain is legitimate brand (e.g., paypal.com, www.paypal.com, login.paypal.com)
        is_official = (hostname == f"{brand}.com" or hostname.endswith(f".{brand}.com") or 
                       hostname == f"{brand}.org" or hostname.endswith(f".{brand}.org"))

        if is_official:
            continue

        # If brand string is present in domain but domain is NOT official, it's Brand Impersonation!
        if brand in hostname:
            matched_brand = brand
            brand_impersonation_detected = True
            flags.append(f"Brand Impersonation Phishing: Domain '{hostname}' contains target brand name '{brand.capitalize()}'")
            score_impact -= 40
            break

        # Check Levenshtein typosquatting against domain_body (e.g. g00gle, paypa1, m1crosoft)
        dist = levenshtein_distance(domain_body, brand)
        if 1 <= dist <= 2 and len(domain_body) >= 4:
            matched_brand = brand
            brand_impersonation_detected = True
            flags.append(f"Typosquatting detected: Domain '{domain_body}' mimics famous brand '{brand.capitalize()}'")
            score_impact -= 35
            break

    # 7. Suspicious Security Keywords Check
    matched_keywords = [kw for kw in SUSPICIOUS_KEYWORDS if kw in path or kw in hostname]
    if "@" in parsed.netloc:
        flags.append("URL contains user-info '@' symbol (credential harvesting indicator)")
        score_impact -= 30

    if matched_keywords:
        flags.append(f"Suspicious phishing keywords in URL: {', '.join(matched_keywords[:4])}")
        score_impact -= (15 * min(len(matched_keywords), 3))

    # 8. Excessively Long URL
    if len(url) > 80:
        flags.append("Excessively long URL (>80 characters)")
        score_impact -= 10

    if score_impact <= -30:
        status = "Dangerous"
    elif score_impact < 0:
        status = "Suspicious"

    return {
        "is_valid": bool(hostname),
        "is_https": is_https,
        "is_ip": is_ip,
        "has_punycode": has_punycode,
        "subdomain_count": subdomain_count,
        "typosquatting_detected": brand_impersonation_detected,
        "target_brand_mimicked": matched_brand,
        "flags": flags,
        "status": status,
        "score_impact": score_impact,
        "hostname": hostname,
        "url_length": len(url)
    }
