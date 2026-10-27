from datetime import datetime
from typing import Dict, Any, List
import whois

def analyze_whois(hostname: str) -> Dict[str, Any]:
    flags: List[str] = []
    score_impact = 0
    domain_age_days = None
    registrar = "Unknown"
    creation_date_str = None
    expiration_date_str = None
    owner = "Redacted for Privacy"

    try:
        w = whois.whois(hostname)
        if w:
            registrar = w.registrar if isinstance(w.registrar, str) else (w.registrar[0] if w.registrar else "Unknown")
            
            c_date = w.creation_date
            if isinstance(c_date, list):
                c_date = c_date[0]
            if isinstance(c_date, datetime):
                creation_date_str = c_date.strftime("%Y-%m-%d")
                domain_age_days = (datetime.utcnow() - c_date).days

            e_date = w.expiration_date
            if isinstance(e_date, list):
                e_date = e_date[0]
            if isinstance(e_date, datetime):
                expiration_date_str = e_date.strftime("%Y-%m-%d")

            if w.org:
                owner = w.org if isinstance(w.org, str) else w.org[0]

    except Exception:
        flags.append("WHOIS privacy enabled or query timed out")

    if domain_age_days is not None:
        if domain_age_days < 30:
            flags.append(f"Newly registered domain (Age: {domain_age_days} days < 30 days threshold)")
            score_impact -= 30
        elif domain_age_days < 180:
            flags.append(f"Recent domain registration (Age: {domain_age_days} days)")
            score_impact -= 10
        elif domain_age_days > 1825: # > 5 years
            score_impact += 20
    else:
        flags.append("Unable to determine domain age from WHOIS")
        score_impact -= 5

    return {
        "domain_age_days": domain_age_days,
        "registrar": registrar,
        "creation_date": creation_date_str,
        "expiration_date": expiration_date_str,
        "owner": owner,
        "flags": flags,
        "score_impact": score_impact
    }
