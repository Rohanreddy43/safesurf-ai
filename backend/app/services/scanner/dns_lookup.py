import socket
import dns.resolver
from typing import Dict, Any, List

def analyze_dns(hostname: str) -> Dict[str, Any]:
    records: Dict[str, List[str]] = {
        "A": [],
        "AAAA": [],
        "MX": [],
        "TXT": [],
        "NS": [],
        "CNAME": []
    }
    flags: List[str] = []
    score_impact = 0

    try:
        resolver = dns.resolver.Resolver()
        resolver.timeout = 3.0
        resolver.lifetime = 3.0

        for r_type in ["A", "AAAA", "MX", "TXT", "NS", "CNAME"]:
            try:
                answers = resolver.resolve(hostname, r_type)
                for rdata in answers:
                    records[r_type].append(str(rdata))
            except Exception:
                pass
    except Exception:
        # Fallback socket lookup if dnspython can't access /etc/resolv.conf
        try:
            ip = socket.gethostbyname(hostname)
            records["A"].append(ip)
        except Exception:
            pass

    if not records["A"] and not records["AAAA"] and not records["CNAME"]:
        flags.append("No IP address (A/AAAA) records found for domain")
        score_impact -= 20

    if not records["MX"]:
        flags.append("No MX (mail server) records configured")
    
    if not any("v=spf1" in txt for txt in records["TXT"]):
        flags.append("Missing SPF (Sender Policy Framework) record in TXT")
        score_impact -= 5

    return {
        "records": records,
        "flags": flags,
        "score_impact": score_impact,
        "has_a_record": len(records["A"]) > 0,
        "has_mx_record": len(records["MX"]) > 0,
        "has_spf": any("v=spf1" in txt for txt in records["TXT"])
    }
