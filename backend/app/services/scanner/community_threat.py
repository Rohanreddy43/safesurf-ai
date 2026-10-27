from typing import Dict, Any

# First-party community reported memory store (in addition to DB persistence)
COMMUNITY_REPORTED_DOMAINS = {
    "phishing-test-site.com": 14,
    "paypal-verification-alert.com": 28,
    "chase-security-login-auth.xyz": 42
}

def analyze_community_threat(domain: str) -> Dict[str, Any]:
    """
    Crowdsourced Community Threat Intelligence Engine
    Checks target domain against first-party crowdsourced reports.
    """
    domain_lower = domain.lower()
    report_count = COMMUNITY_REPORTED_DOMAINS.get(domain_lower, 0)
    is_community_flagged = report_count > 0

    return {
        "status": "completed",
        "is_community_flagged": is_community_flagged,
        "community_reports_count": report_count,
        "threat_status": "Flagged by Community" if is_community_flagged else "Clean (No User Reports)"
    }

def add_community_report(domain: str) -> int:
    domain_lower = domain.lower()
    current = COMMUNITY_REPORTED_DOMAINS.get(domain_lower, 0)
    COMMUNITY_REPORTED_DOMAINS[domain_lower] = current + 1
    return COMMUNITY_REPORTED_DOMAINS[domain_lower]
