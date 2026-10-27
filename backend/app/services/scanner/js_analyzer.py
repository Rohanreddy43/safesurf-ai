import re
from typing import Dict, Any, List
from bs4 import BeautifulSoup

OBFUSCATION_PATTERNS = [
    (r"eval\s*\(\s*function\s*\(\s*p\s*,\s*a\s*,\s*c\s*,\s*k\s*,\s*e\s*,\s*d\s*\)", "Packed JavaScript (Dean Edwards Packer)"),
    (r"unescape\s*\(\s*['\"]%[0-9a-fA-F]{2}", "Percent-encoded Hex String Obfuscation"),
    (r"String\.fromCharCode\s*\(\s*(?:\d+\s*,\s*){3,}", "CharFromCode Dynamic String Assembly"),
    (r"atob\s*\(\s*['\"][A-Za-z0-9+/=]{20,}", "Base64 Obfuscated Payload Decoding"),
    (r"_0x[a-f0-9]{4,}\s*=", "Hex Variable Name Obfuscation (JSConfuser/Obfuscator.io)"),
]

KEYLOGGER_PATTERNS = [
    (r"addEventListener\s*\(\s*['\"]key(?:press|down|up)['\"]", "Keyboard Event Listener Interceptor"),
    (r"onkey(?:press|down|up)\s*=", "Inline Keypress Event Listener"),
    (r"document\.forms\[\d+\]\.submit", "Programmatic Form Interception"),
]

FINGERPRINTING_PATTERNS = [
    (r"canvas\.toDataURL\s*\(", "HTML5 Canvas Fingerprinting"),
    (r"getWebGLRenderingContext|WEBGL_debug_renderer_info", "WebGL Hardware Fingerprinting"),
    (r"navigator\.plugins\.length", "Browser Plugin Enumeration"),
]

CRYPTO_MINER_PATTERNS = [
    (r"CoinHive|coinhive\.min\.js", "CoinHive Browser Crypto Miner"),
    (r"CryptoNoter|deepMiner|cryptonight", "CryptoNoter / Altcoin Browser Miner"),
]

WEBSOCKET_PATTERNS = [
    (r"new\s+WebSocket\s*\(\s*['\"]wss?://", "WebSocket External Telemetry Pipe"),
]

def analyze_javascript(html_content: str = "") -> Dict[str, Any]:
    """
    JavaScript Static & Dynamic Analysis Engine
    Finds obfuscated JS, credential theft keyloggers, fingerprinting, and crypto miners.
    """
    findings = []
    has_obfuscated = False
    has_keylogger = False
    has_fingerprinting = False
    has_miner = False
    has_websocket = False

    if html_content:
        soup = BeautifulSoup(html_content, "html.parser")
        scripts = [s.get_text() for s in soup.find_all("script") if s.get_text()]
        full_js = "\n".join(scripts)

        # Check Obfuscation
        for pattern, name in OBFUSCATION_PATTERNS:
            if re.search(pattern, full_js, re.IGNORECASE):
                has_obfuscated = True
                findings.append({"category": "Obfuscation", "pattern": name, "severity": "HIGH"})

        # Check Keyloggers
        for pattern, name in KEYLOGGER_PATTERNS:
            if re.search(pattern, full_js, re.IGNORECASE):
                has_keylogger = True
                findings.append({"category": "Credential Harvesting", "pattern": name, "severity": "CRITICAL"})

        # Check Fingerprinting
        for pattern, name in FINGERPRINTING_PATTERNS:
            if re.search(pattern, full_js, re.IGNORECASE):
                has_fingerprinting = True
                findings.append({"category": "Fingerprinting", "pattern": name, "severity": "MEDIUM"})

        # Check Crypto Miners
        for pattern, name in CRYPTO_MINER_PATTERNS:
            if re.search(pattern, full_js, re.IGNORECASE):
                has_miner = True
                findings.append({"category": "Crypto Miner", "pattern": name, "severity": "HIGH"})

        # Check WebSockets
        for pattern, name in WEBSOCKET_PATTERNS:
            if re.search(pattern, full_js, re.IGNORECASE):
                has_websocket = True
                findings.append({"category": "WebSocket Backdoor", "pattern": name, "severity": "MEDIUM"})

    risk_level = "SAFE"
    if has_keylogger or (has_obfuscated and has_websocket):
        risk_level = "CRITICAL"
    elif has_obfuscated or has_miner:
        risk_level = "HIGH"
    elif has_fingerprinting:
        risk_level = "MEDIUM"

    return {
        "status": "completed",
        "risk_level": risk_level,
        "total_findings": len(findings),
        "findings": findings,
        "has_obfuscated_js": has_obfuscated,
        "has_keylogger": has_keylogger,
        "has_fingerprinting": has_fingerprinting,
        "has_crypto_miner": has_miner,
        "has_websocket_pipe": has_websocket
    }
