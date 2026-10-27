from typing import Dict, Any

def summarize_infrastructure_intelligence(
    ssl_res: Dict[str, Any],
    dns_res: Dict[str, Any],
    whois_res: Dict[str, Any],
    hosting_res: Dict[str, Any]
) -> Dict[str, Any]:
    """
    SSL, DNS & Domain Intelligence Engine
    Combines SSL certificate audit, WHOIS domain age, DNS records, and hosting IP reputation.
    """
    is_new_domain = False
    domain_age_days = whois_res.get("domain_age_days")
    if domain_age_days is not None and domain_age_days < 30:
        is_new_domain = True

    has_valid_ssl = ssl_res.get("valid", False)
    is_self_signed = ssl_res.get("is_self_signed", False)
    
    dns_records = dns_res.get("records", {})
    has_mx = len(dns_records.get("MX", [])) > 0
    has_spf = dns_res.get("has_spf", False)

    infra_score = 100
    risk_factors = []

    if not has_valid_ssl:
        infra_score -= 30
        risk_factors.append("Invalid or missing SSL certificate")
    elif is_self_signed:
        infra_score -= 25
        risk_factors.append("Self-signed untrusted SSL certificate")

    if is_new_domain:
        infra_score -= 35
        risk_factors.append(f"Newly registered domain ({domain_age_days} days old)")

    if not has_mx:
        infra_score -= 10
        risk_factors.append("No MX mail records configured for domain")

    if not has_spf:
        infra_score -= 10
        risk_factors.append("Missing SPF email authentication record")

    infra_score = max(infra_score, 0)
    trust_grade = "A"
    if infra_score < 40:
        trust_grade = "F"
    elif infra_score < 60:
        trust_grade = "D"
    elif infra_score < 80:
        trust_grade = "C"
    elif infra_score < 90:
        trust_grade = "B"

    return {
        "status": "completed",
        "trust_score": infra_score,
        "trust_grade": trust_grade,
        "is_newly_registered": is_new_domain,
        "domain_age_days": domain_age_days,
        "ssl_valid": has_valid_ssl,
        "is_self_signed_ssl": is_self_signed,
        "has_mx_records": has_mx,
        "has_spf_record": has_spf,
        "hosting_ip": hosting_res.get("ip_address"),
        "hosting_country": hosting_res.get("country"),
        "hosting_isp": hosting_res.get("isp"),
        "risk_factors": risk_factors
    }
