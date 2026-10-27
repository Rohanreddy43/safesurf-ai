from typing import Dict, Any, List

def calculate_ai_risk(
    url_res: Dict[str, Any],
    dns_res: Dict[str, Any],
    whois_res: Dict[str, Any],
    ssl_res: Dict[str, Any],
    hosting_res: Dict[str, Any],
    redirect_res: Dict[str, Any],
    html_res: Dict[str, Any],
    headers_res: Dict[str, Any],
    threat_res: Dict[str, Any],
    category_res: Dict[str, Any] = None,
    crawler_res: Dict[str, Any] = None,
    visual_res: Dict[str, Any] = None,
    js_res: Dict[str, Any] = None,
    infra_res: Dict[str, Any] = None,
    sandbox_res: Dict[str, Any] = None,
    vision_res: Dict[str, Any] = None,
    favicon_res: Dict[str, Any] = None,
    legitimacy_res: Dict[str, Any] = None,
    kit_res: Dict[str, Any] = None,
    community_res: Dict[str, Any] = None
) -> Dict[str, Any]:
    """
    AI Risk Scoring & Explanation Engine
    Aggregates all security modules into a weighted risk trust score (0–100) with plain-English AI explanations.
    """
    base_score = 100
    deductions: List[Dict[str, Any]] = []
    bonuses: List[Dict[str, Any]] = []

    # 1. Website Crawling & Discovery
    if crawler_res:
        if crawler_res.get("has_hidden_login_portal"):
            deductions.append({"factor": "Hidden Login Portal Discovered", "points": 15, "reason": "Found unlinked login or authentication route during crawl"})
        if crawler_res.get("has_external_form_posts"):
            deductions.append({"factor": "External Form Action Endpoint", "points": 20, "reason": "Form submits credentials to a third-party domain"})

    # 2. URL & Typosquatting
    if not url_res.get("is_https"):
        deductions.append({"factor": "Insecure Protocol", "points": 15, "reason": "No HTTPS encryption present"})
    else:
        bonuses.append({"factor": "Valid HTTPS Protocol", "points": 10, "reason": "SSL/TLS connection enabled"})

    if url_res.get("typosquatting_detected"):
        target = url_res.get("target_brand_mimicked")
        deductions.append({"factor": "Brand Mimicry / Typosquatting", "points": 35, "reason": f"Mimics official domain for '{target}'"})

    if url_res.get("is_ip"):
        deductions.append({"factor": "IP Address URL", "points": 25, "reason": "Uses raw IP address instead of registered domain"})

    if url_res.get("has_punycode"):
        deductions.append({"factor": "Homograph Attack Vector", "points": 30, "reason": "Contains Unicode/Punycode homograph characters"})

    url_flags = url_res.get("flags", [])
    for flag in url_flags:
        if "suspicious TLD" in flag:
            deductions.append({"factor": "High-Risk Suspicious TLD", "points": 25, "reason": flag})
        elif "phishing keywords" in flag:
            deductions.append({"factor": "Suspicious Security Keywords", "points": 20, "reason": flag})

    # 3. DNS Resolution
    if not dns_res.get("has_a_record"):
        deductions.append({"factor": "Unresolved DNS Records", "points": 25, "reason": "No active A/AAAA DNS records resolved for domain"})

    # 4. Threat Intelligence
    if threat_res.get("flagged_count", 0) > 0:
        deductions.append({"factor": "Blacklisted by Threat Feeds", "points": 50, "reason": "Flagged as malicious by VirusTotal / Google Safe Browsing / PhishTank / OpenPhish / URLHaus"})
    else:
        bonuses.append({"factor": "Threat Intelligence Clean", "points": 20, "reason": "No security blacklists flagged this domain"})

    # 5. Visual Similarity Engine
    if visual_res and visual_res.get("is_cloned_brand"):
        brand = visual_res.get("matched_brand")
        deductions.append({"factor": "Cloned Brand Interface Detected", "points": 45, "reason": f"Visual layout & logo signature matches cloned '{brand}' portal"})

    # 6. JavaScript Static & Dynamic Analysis
    if js_res:
        if js_res.get("has_keylogger"):
            deductions.append({"factor": "Credential Keylogger Script", "points": 40, "reason": "Monitors keyboard events to harvest sensitive input fields"})
        if js_res.get("has_obfuscated_js"):
            deductions.append({"factor": "Obfuscated JavaScript Payload", "points": 20, "reason": "Contains packed or hex-encoded obfuscated code"})
        if js_res.get("has_crypto_miner"):
            deductions.append({"factor": "Unauthorized Crypto Miner", "points": 30, "reason": "Executes browser-based cryptocurrency mining scripts"})

    # 7. HTML & Form Security
    findings = html_res.get("findings", {})
    if findings.get("hidden_iframes", 0) > 0:
        deductions.append({"factor": "Hidden Iframes", "points": 20, "reason": "Contains invisible 0px iframe elements used for clickjacking"})

    # 8. SSL, DNS & Domain Intelligence
    if infra_res:
        if infra_res.get("is_newly_registered"):
            age = infra_res.get("domain_age_days", 0)
            deductions.append({"factor": "Newly Registered Domain", "points": 35, "reason": f"Domain registered only {age} days ago (<30 days threshold)"})
        if infra_res.get("is_self_signed_ssl"):
            deductions.append({"factor": "Self-Signed Untrusted SSL", "points": 25, "reason": "SSL certificate is self-signed and untrusted"})

    # 9. Behavioral Sandbox Simulator
    if sandbox_res:
        if sandbox_res.get("auto_download_triggered"):
            deductions.append({"factor": "Automatic File Download Trigger", "points": 35, "reason": "Automatically prompts browser payload download upon page visit"})
        if sandbox_res.get("has_alert_loop"):
            deductions.append({"factor": "Alert Dialog Browser Lock", "points": 20, "reason": "Uses infinite JavaScript alert loops to lock user browser"})

    # 10. AI Vision & Text Content Analysis
    if vision_res and vision_res.get("has_phishing_intent"):
        deductions.append({"factor": "Phishing Language & Urgency Bait", "points": 30, "reason": "Contains high-urgency phishing language ('Account Suspended', 'Verify Credentials')"})

    # 11. Favicon Hashing & Brand Fingerprinting
    if favicon_res:
        if favicon_res.get("is_favicon_spoofed"):
            brand = favicon_res.get("brand_matched")
            deductions.append({"factor": "Favicon MurmurHash Brand Spoofing", "points": 40, "reason": f"Favicon Murmur3 hash matches '{brand}' but domain does not match official brand"})
        elif favicon_res.get("brand_matched"):
            bonuses.append({"factor": "Favicon Hash Matched", "points": 10, "reason": f"Favicon MurmurHash3 matches verified brand signature ({favicon_res.get('brand_matched')})"})

    # 12. Site Structure & Legitimacy Audit
    if legitimacy_res:
        if legitimacy_res.get("is_isolated_phishing_kit"):
            deductions.append({"factor": "Isolated 1-Page Phishing Kit", "points": 30, "reason": "Lacks robots.txt, sitemap.xml, privacy policy, and multi-page business structure"})
        elif legitimacy_res.get("legitimacy_score", 0) >= 70:
            bonuses.append({"factor": "Verified Site Structure", "points": 15, "reason": "Presents legitimate robots.txt, sitemap.xml, and multi-page business layout"})

    # 13. Tech Stack & Phishing Kit Fingerprinter
    if kit_res:
        if kit_res.get("phishing_kit_detected"):
            templates = ", ".join(kit_res.get("detected_templates", []))
            deductions.append({"factor": "Phishing Kit Template Fingerprint", "points": 45, "reason": f"Matched signature for reusable phishing framework ({templates})"})

    # 14. Crowdsourced Community Threat Database
    if community_res:
        if community_res.get("is_community_flagged"):
            cnt = community_res.get("community_reports_count", 1)
            deductions.append({"factor": "Flagged by Community Users", "points": 40, "reason": f"Reported as phishing by {cnt} SafeSurf AI community members"})

    # 15. Content Category Warnings
    if category_res:
        if category_res.get("is_adult"):
            deductions.append({"factor": "Adult Content 🔞", "points": 15, "reason": "Contains age-restricted explicit adult content"})
        if category_res.get("is_gambling"):
            deductions.append({"factor": "Online Gambling 🎲", "points": 15, "reason": "Contains real-money betting or casino games"})

    # Compute Final Score
    total_deductions = sum(d["points"] for d in deductions)
    total_bonuses = sum(b["points"] for b in bonuses)
    final_score = max(0, min(100, base_score - total_deductions + total_bonuses))

    if final_score >= 80:
        status = "Safe"
    elif final_score >= 50:
        status = "Suspicious"
    else:
        status = "Malicious"

    # Plain English AI Explanation Generator
    explanation_parts = []
    explanation_parts.append(f"SafeSurf AI evaluated this URL across all security inspection modules and assigned a Security Trust Score of {final_score}/100 ({status.upper()}).")

    if status == "Safe":
        explanation_parts.append("The domain demonstrates clean infrastructure signals, valid encryption, clean threat feeds, and standard content features.")
    elif status == "Suspicious":
        explanation_parts.append("Caution advised. Multiple security inspection modules flagged suspicious characteristics during audit.")
    else:
        explanation_parts.append("DANGER: High probability of phishing, brand impersonation, or credential harvesting. Do NOT enter sensitive credentials or download files.")

    if deductions:
        top_reasons = [f"- {d['factor']}: {d['reason']}" for d in deductions[:5]]
        explanation_parts.append("Top Risk Vector Findings:\n" + "\n".join(top_reasons))

    if bonuses:
        top_bonuses = [f"- {b['factor']}: {b['reason']}" for b in bonuses[:3]]
        explanation_parts.append("Positive Trust Signals:\n" + "\n".join(top_bonuses))

    explanation_text = "\n\n".join(explanation_parts)

    return {
        "final_score": final_score,
        "status": status,
        "explanation": explanation_text,
        "deductions": deductions,
        "bonuses": bonuses,
        "breakdown": {
            "base_score": base_score,
            "total_deductions": total_deductions,
            "total_bonuses": total_bonuses
        }
    }
