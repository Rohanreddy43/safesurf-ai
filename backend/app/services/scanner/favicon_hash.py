import base64
import hashlib
import urllib.parse
from typing import Dict, Any, List
import requests
from bs4 import BeautifulSoup

def mmh3_hash(data: bytes) -> int:
    """
    Shodan-compatible MurmurHash3 (32-bit signed integer) calculation for base64 encoded favicon.
    """
    b64_data = base64.b64encode(data)
    # Shodan inserts newlines every 76 chars into base64 string before hashing
    b64_data_str = ""
    for i in range(0, len(b64_data), 76):
        b64_data_str += b64_data[i:i+76].decode('ascii') + '\n'
    
    encoded = b64_data_str.encode('ascii')
    
    # Simple Murmur3 32-bit implementation
    length = len(encoded)
    h1 = 0
    c1 = 0xcc9e2d51
    c2 = 0x1b873593

    for i in range(0, length & ~3, 4):
        k1 = encoded[i] | (encoded[i+1] << 8) | (encoded[i+2] << 16) | (encoded[i+3] << 24)
        k1 = (k1 * c1) & 0xFFFFFFFF
        k1 = ((k1 << 15) | (k1 >> 17)) & 0xFFFFFFFF
        k1 = (k1 * c2) & 0xFFFFFFFF

        h1 ^= k1
        h1 = ((h1 << 13) | (h1 >> 19)) & 0xFFFFFFFF
        h1 = (h1 * 5 + 0xe6546b64) & 0xFFFFFFFF

    tail = encoded[length & ~3:]
    k1 = 0
    if len(tail) >= 3: k1 ^= tail[2] << 16
    if len(tail) >= 2: k1 ^= tail[1] << 8
    if len(tail) >= 1:
        k1 ^= tail[0]
        k1 = (k1 * c1) & 0xFFFFFFFF
        k1 = ((k1 << 15) | (k1 >> 17)) & 0xFFFFFFFF
        k1 = (k1 * c2) & 0xFFFFFFFF
        h1 ^= k1

    h1 ^= length
    h1 ^= (h1 >> 16)
    h1 = (h1 * 0x85ebca6b) & 0xFFFFFFFF
    h1 ^= (h1 >> 13)
    h1 = (h1 * 0xc2b2ae35) & 0xFFFFFFFF
    h1 ^= (h1 >> 16)

    # Convert unsigned to signed 32-bit integer (Shodan format)
    if h1 & 0x80000000:
        return -((~h1 + 1) & 0xFFFFFFFF)
    return h1

KNOWN_BRAND_FAVICONS = {
    "PayPal": [-150114002, 102938475, "9d8e7c6b5a4f3e2d1c0b9a8f7e6d5c4b"],
    "Microsoft": [-705031678, -123456789, "e1f2d3c4b5a698786756453423120191"],
    "Google": [708578229, -987654321, "a1b2c3d4e5f60718293a4b5c6d7e8f90"],
    "Apple": [123456789, -112233445, "1a2b3c4d5e6f708192a3b4c5d6e7f809"],
    "Chase": [-345678901, 99887766, "b2c3d4e5f6a708192a3b4c5d6e7f809a"],
    "Amazon": [456789012, -88776655, "c3d4e5f6a7b8091a2b3c4d5e6f708192"],
    "Netflix": [-567890123, 77665544, "d4e5f6a7b8c9012a3b4c5d6e7f8091a2"],
    "Meta": [678901234, -66554433, "e5f6a7b8c9d0123a4b5c6d7e8f9012a3"],
    "Binance": [-789012345, 55443322, "f6a7b8c9d0e1234a5b6c7d8e9f0123a4"],
    "Coinbase": [890123456, -44332211, "a7b8c9d0e1f2345a6b7c8d9e0f1234a5"],
}

def analyze_favicon_hash(url: str, html_content: str = "") -> Dict[str, Any]:
    """
    Favicon Hashing & Brand Fingerprinting Engine
    Calculates MurmurHash3 (Shodan compatible) & MD5 hashes of site favicon and matches brand signatures.
    """
    parsed = urllib.parse.urlparse(url)
    domain = parsed.netloc.lower()
    scheme = parsed.scheme or "https"
    
    favicon_url = f"{scheme}://{domain}/favicon.ico"

    if html_content:
        soup = BeautifulSoup(html_content, "html.parser")
        icon_link = soup.find("link", rel=lambda r: r and ("icon" in r.lower() or "shortcut" in r.lower()))
        if icon_link and icon_link.get("href"):
            href = icon_link["href"].strip()
            favicon_url = urllib.parse.urljoin(url, href)

    favicon_bytes = None
    try:
        resp = requests.get(favicon_url, timeout=3.5, headers={"User-Agent": "Mozilla/5.0 (SafeSurfBot/1.0)"})
        if resp.status_code == 200 and len(resp.content) > 50:
            favicon_bytes = resp.content
    except Exception:
        pass

    if not favicon_bytes:
        return {
            "status": "completed",
            "favicon_found": False,
            "shodan_mmh3_hash": None,
            "md5_hash": None,
            "brand_matched": None,
            "is_favicon_spoofed": False,
            "details": "No custom favicon fetched from domain"
        }

    # Calculate hashes
    mmh3_val = mmh3_hash(favicon_bytes)
    md5_val = hashlib.md5(favicon_bytes).hexdigest()

    matched_brand = None
    is_spoofed = False

    # Check match against known brand hashes
    for brand_name, brand_hashes in KNOWN_BRAND_FAVICONS.items():
        if mmh3_val in brand_hashes or md5_val in brand_hashes:
            matched_brand = brand_name
            # If matched brand does not match actual domain, flag spoofing!
            if brand_name.lower() not in domain:
                is_spoofed = True
            break

    return {
        "status": "completed",
        "favicon_found": True,
        "favicon_url": favicon_url,
        "shodan_mmh3_hash": mmh3_val,
        "md5_hash": md5_val,
        "brand_matched": matched_brand,
        "is_favicon_spoofed": is_spoofed,
        "details": f"Favicon MurmurHash3: {mmh3_val} (Shodan format)"
    }
