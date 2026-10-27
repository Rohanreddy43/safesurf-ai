import re
from typing import Dict, Any, List
from bs4 import BeautifulSoup

KNOWN_KIT_SIGNATURES = [
    (r"1337|zsecurity|necro|spammer|nexphisher|blackeye", "BlackEye / NexPhisher Kit Template"),
    (r"login_files/|auth_files/|secure_files/|web_files/", "Generic Reused Phishing Kit Folder Structure"),
    (r"action=['\"]post\.php['\"]|action=['\"]send\.php['\"]|action=['\"]login\.php['\"]", "PHP Credential Exfiltration Handler (post.php/send.php)"),
    (r"TelegramBot|api\.telegram\.org/bot", "Telegram Exfiltration Bot Endpoint"),
    (r"discord\.com/api/webhooks", "Discord Webhook Credential Exfiltration Pipe"),
]

def analyze_phishing_kit_fingerprint(html_content: str = "") -> Dict[str, Any]:
    """
    Tech Stack & Phishing Kit Fingerprinter Engine
    Detects reusable phishing kit templates, exfiltration handlers, and tech stack signatures.
    """
    detected_kits = []
    has_exfiltration_pipe = False
    kit_template_detected = False

    if html_content:
        for pattern, kit_name in KNOWN_KIT_SIGNATURES:
            if re.search(pattern, html_content, re.IGNORECASE):
                detected_kits.append(kit_name)
                kit_template_detected = True
                if "Telegram" in kit_name or "Discord" in kit_name or "Exfiltration" in kit_name:
                    has_exfiltration_pipe = True

    return {
        "status": "completed",
        "phishing_kit_detected": kit_template_detected,
        "has_exfiltration_pipe": has_exfiltration_pipe,
        "detected_templates": detected_kits,
        "matched_kit_count": len(detected_kits),
        "fingerprint_confidence": "HIGH" if len(detected_kits) > 1 else ("MEDIUM" if kit_template_detected else "NONE")
    }
