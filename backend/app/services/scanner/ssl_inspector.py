import socket
import ssl
from datetime import datetime
from typing import Dict, Any, List

def analyze_ssl(hostname: str, port: int = 443) -> Dict[str, Any]:
    flags: List[str] = []
    score_impact = 0
    valid = False
    issuer = "Unknown"
    expiry_date_str = None
    tls_version = "Unknown"
    cipher_suite = "Unknown"
    days_until_expiry = None
    is_self_signed = False

    try:
        context = ssl.create_default_context()
        with socket.create_connection((hostname, port), timeout=4.0) as sock:
            with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                cert = ssock.getpeercert()
                tls_version = ssock.version()
                cipher = ssock.cipher()
                if cipher:
                    cipher_suite = cipher[0]

                # Issuer
                issuer_components = dict(x[0] for x in cert.get('issuer', []))
                issuer = issuer_components.get('organizationName', issuer_components.get('commonName', 'Unknown Issuer'))

                # Subject
                subject_components = dict(x[0] for x in cert.get('subject', []))
                if issuer_components == subject_components:
                    is_self_signed = True
                    flags.append("Self-signed SSL certificate detected")
                    score_impact -= 25

                # Expiry
                not_after = cert.get('notAfter')
                if not_after:
                    expiry_dt = datetime.strptime(not_after, "%b %d %H:%M:%S %Y %Z")
                    expiry_date_str = expiry_dt.strftime("%Y-%m-%d")
                    days_until_expiry = (expiry_dt - datetime.utcnow()).days
                    if days_until_expiry < 0:
                        flags.append("SSL Certificate is expired")
                        score_impact -= 30
                    elif days_until_expiry < 14:
                        flags.append(f"SSL Certificate expiring soon ({days_until_expiry} days remaining)")
                        score_impact -= 10
                    else:
                        valid = True
                        score_impact += 10

                if tls_version in ["TLSv1", "TLSv1.1"]:
                    flags.append(f"Weak TLS protocol in use ({tls_version})")
                    score_impact -= 15

    except Exception as e:
        flags.append(f"SSL Certificate handshake failed or not present ({str(e)})")
        score_impact -= 25

    return {
        "valid": valid,
        "issuer": issuer,
        "expiry_date": expiry_date_str,
        "days_until_expiry": days_until_expiry,
        "tls_version": tls_version,
        "cipher_suite": cipher_suite,
        "is_self_signed": is_self_signed,
        "flags": flags,
        "score_impact": score_impact
    }
