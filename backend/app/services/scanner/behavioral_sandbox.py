import re
import urllib.parse
from typing import Dict, Any, List
from bs4 import BeautifulSoup

MALICIOUS_EXTENSIONS = [".exe", ".scr", ".bat", ".vbs", ".ps1", ".iso", ".img", ".apk", ".zip"]

def analyze_behavioral_sandbox(formatted_url: str, redirect_res: Dict[str, Any], html_content: str = "") -> Dict[str, Any]:
    """
    Behavioral Sandbox Simulator
    Observes redirects, automatic downloads, popup prompts, notification abuse, and runtime behaviors.
    """
    reasons = []
    suspicious_behavior = False
    
    # 1. Inspect redirect hops
    hop_count = redirect_res.get("hop_count", 1)
    is_infinite_loop = redirect_res.get("is_infinite_loop", False)
    has_cross_domain_redirect = redirect_res.get("has_cross_domain_redirect", False)

    if is_infinite_loop:
        suspicious_behavior = True
        reasons.append("Infinite HTTP redirect loop detected")
    elif hop_count > 3:
        suspicious_behavior = True
        reasons.append(f"Excessive HTTP redirect hops ({hop_count} redirects)")
    elif has_cross_domain_redirect:
        reasons.append("Cross-domain redirect hop detected")

    # 2. Inspect automatic downloads in HTML
    auto_download_triggered = False
    downloaded_files = []
    
    if html_content:
        soup = BeautifulSoup(html_content, "html.parser")
        # Check meta refresh with url
        meta_refresh = soup.find("meta", attrs={"http-equiv": re.compile(r"refresh", re.I)})
        if meta_refresh:
            content = meta_refresh.get("content", "")
            if any(ext in content.lower() for ext in MALICIOUS_EXTENSIONS):
                auto_download_triggered = True
                suspicious_behavior = True
                reasons.append("Meta-refresh automatic payload download triggered")

        # Check links with download attribute or executable extensions
        for a in soup.find_all("a", href=True):
            href = a["href"].lower()
            if any(ext in href for ext in MALICIOUS_EXTENSIONS):
                downloaded_files.append(a["href"])
                if a.get("autofocus") or "click()" in str(a):
                    auto_download_triggered = True
                    suspicious_behavior = True
                    reasons.append(f"Auto-clicking executable payload link detected: {a['href']}")

    # 3. Check for Notification Abuse & Alert Dialog Loops
    has_alert_loop = False
    has_notification_abuse = False
    if html_content:
        if re.search(r"while\s*\(\s*true\s*\)\s*\{\s*alert", html_content, re.I):
            has_alert_loop = True
            suspicious_behavior = True
            reasons.append("Alert dialog locking loop detected")
        if re.search(r"Notification\.requestPermission", html_content, re.I):
            has_notification_abuse = True
            reasons.append("Browser Push Notification Permission prompt requested")

    risk_rating = "LOW"
    if suspicious_behavior and auto_download_triggered:
        risk_rating = "CRITICAL"
    elif suspicious_behavior:
        risk_rating = "HIGH"

    return {
        "status": "completed",
        "sandbox_execution": "success",
        "risk_rating": risk_rating,
        "suspicious_behavior_detected": suspicious_behavior,
        "redirect_hop_count": hop_count,
        "auto_download_triggered": auto_download_triggered,
        "downloaded_files": downloaded_files[:5],
        "has_alert_loop": has_alert_loop,
        "has_notification_abuse": has_notification_abuse,
        "behavioral_alerts": reasons
    }
