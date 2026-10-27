import re
import httpx
from bs4 import BeautifulSoup
from typing import Dict, Any, List

async def analyze_html(url: str) -> Dict[str, Any]:
    flags: List[str] = []
    score_impact = 0
    findings = {
        "hidden_iframes": 0,
        "password_forms": 0,
        "js_redirects": False,
        "obfuscated_js": False,
        "base64_scripts": 0,
        "inline_event_handlers": 0,
        "crypto_miners": False,
        "suspicious_external_scripts": 0
    }

    if not url.startswith("http://") and not url.startswith("https://"):
        url = "https://" + url

    html_content = ""
    try:
        async with httpx.AsyncClient(timeout=6.0, follow_redirects=True, verify=False) as client:
            resp = await client.get(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) SafeSurfAI/1.0"})
            if resp.status_code == 200:
                html_content = resp.text
    except Exception:
        flags.append("Failed to fetch HTML content for client-side inspection")
        return {"findings": findings, "flags": flags, "score_impact": 0}

    if not html_content:
        return {"findings": findings, "flags": flags, "score_impact": 0}

    soup = BeautifulSoup(html_content, "html.parser")

    # 1. Hidden iframes
    iframes = soup.find_all("iframe")
    for iframe in iframes:
        style = iframe.get("style", "").lower()
        width = iframe.get("width", "")
        height = iframe.get("height", "")
        if "display:none" in style or "visibility:hidden" in style or width in ["0", "1"] or height in ["0", "1"]:
            findings["hidden_iframes"] += 1
    if findings["hidden_iframes"] > 0:
        flags.append(f"Hidden iframe(s) detected ({findings['hidden_iframes']} count)")
        score_impact -= 25

    # 2. Password forms on non-HTTPS
    forms = soup.find_all("form")
    for form in forms:
        inputs = form.find_all("input")
        has_pass = any(inp.get("type", "").lower() == "password" for inp in inputs)
        action = form.get("action", "").lower()
        if has_pass:
            findings["password_forms"] += 1
            if not url.startswith("https://") or (action.startswith("http://")):
                flags.append("Password input form submitted over unencrypted HTTP")
                score_impact -= 25

    # 3. JavaScript Redirects
    if re.search(r"window\.location(\.href)?\s*=", html_content, re.IGNORECASE) or re.search(r"document\.location(\.href)?\s*=", html_content, re.IGNORECASE):
        findings["js_redirects"] = True
        flags.append("Client-side JavaScript location redirect code detected")
        score_impact -= 10

    # 4. Obfuscated JS (eval(function(p,a,c,k,e,d) or excessive hex)
    if "eval(function(p,a,c,k,e," in html_content or len(re.findall(r"\\x[0-9a-fA-F]{2}", html_content)) > 20:
        findings["obfuscated_js"] = True
        flags.append("Obfuscated or packed JavaScript code detected")
        score_impact -= 20

    # 5. Base64 scripts
    base64_srcs = len(re.findall(r"src=[\"']data:text/javascript;base64,", html_content, re.IGNORECASE))
    findings["base64_scripts"] = base64_srcs
    if base64_srcs > 0:
        flags.append(f"Base64 encoded embedded script tag(s) detected ({base64_srcs})")
        score_impact -= 15

    # 6. Inline event handlers (onload, onerror, onclick in raw html)
    inline_events = len(re.findall(r"\son[a-z]+\s*=", html_content, re.IGNORECASE))
    findings["inline_event_handlers"] = inline_events
    if inline_events > 15:
        flags.append(f"Excessive inline JavaScript event handlers ({inline_events})")
        score_impact -= 5

    # 7. Crypto miners (CoinHive, CryptoLoot patterns)
    if "coinhive" in html_content.lower() or "cryptoloot" in html_content.lower() or "miner.start()" in html_content.lower():
        findings["crypto_miners"] = True
        flags.append("Cryptocurrency browser miner script detected!")
        score_impact -= 40

    return {
        "findings": findings,
        "flags": flags,
        "score_impact": score_impact
    }
