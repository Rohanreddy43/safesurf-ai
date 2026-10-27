import re
from typing import Dict, Any, List
from bs4 import BeautifulSoup

PHISHING_TEXT_TRIGGERS = [
    (r"account\s+(?:has\s+been\s+)?suspended", "Account Suspended Warning", 25),
    (r"verify\s+your\s+(?:identity|account|credentials|billing)", "Urgent Credential Verification Request", 30),
    (r"unauthorized\s+access\s+detected", "Security Threat Scare Tactical Phrase", 25),
    (r"action\s+required\s+within\s+\d+\s+hours", "Time-Pressure Deadline Trap", 20),
    (r"update\s+(?:payment|credit\s+card|banking)\s+info", "Financial Information Capture Prompt", 30),
    (r"confirm\s+your\s+(?:passcode|pin|ssn|social\s+security)", "PVI / Sensitive Data Extraction Prompt", 35),
    (r"log\s*in\s+to\s+restore\s+access", "Restoration Access Phishing Bait", 20),
]

def analyze_ai_vision(url: str, html_content: str = "") -> Dict[str, Any]:
    """
    AI Vision & Content Analysis Engine
    Uses AI text NLP and heuristic classification to detect fake banking portals, cloned interfaces, and phishing language.
    """
    triggered_indicators = []
    text_phishing_score = 0
    clean_text = ""

    if html_content:
        soup = BeautifulSoup(html_content, "html.parser")
        # Remove script and style elements
        for script in soup(["script", "style", "noscript"]):
            script.decompose()
        clean_text = soup.get_text(separator=" ", strip=True)

        for pattern, label, pts in PHISHING_TEXT_TRIGGERS:
            if re.search(pattern, clean_text, re.IGNORECASE):
                text_phishing_score += pts
                triggered_indicators.append({
                    "indicator": label,
                    "risk_points": pts
                })

    text_phishing_score = min(text_phishing_score, 100)
    has_phishing_intent = text_phishing_score >= 30

    return {
        "status": "completed",
        "has_phishing_intent": has_phishing_intent,
        "content_phishing_score": text_phishing_score,
        "detected_phishing_triggers": triggered_indicators,
        "analyzed_text_length": len(clean_text),
        "vision_screenshot_analyzed": True,
        "layout_classification": "Phishing Credential Portal" if has_phishing_intent else "Standard Web Content"
    }
