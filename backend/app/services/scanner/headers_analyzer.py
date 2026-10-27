import httpx
from typing import Dict, Any, List

async def analyze_headers(url: str) -> Dict[str, Any]:
    flags: List[str] = []
    score_impact = 0
    header_grades = {}

    if not url.startswith("http://") and not url.startswith("https://"):
        url = "https://" + url

    headers = {}
    try:
        async with httpx.AsyncClient(timeout=5.0, verify=False, follow_redirects=True) as client:
            resp = await client.head(url)
            headers = {k.lower(): v for k, v in resp.headers.items()}
    except Exception:
        pass

    # 1. Content-Security-Policy (CSP)
    csp = headers.get("content-security-policy")
    if csp:
        header_grades["Content-Security-Policy"] = "Present"
        score_impact += 5
    else:
        header_grades["Content-Security-Policy"] = "Missing"
        flags.append("Missing Content-Security-Policy (CSP) header")
        score_impact -= 5

    # 2. Strict-Transport-Security (HSTS)
    hsts = headers.get("strict-transport-security")
    if hsts:
        header_grades["Strict-Transport-Security"] = "Present"
        score_impact += 5
    else:
        header_grades["Strict-Transport-Security"] = "Missing"
        flags.append("Missing Strict-Transport-Security (HSTS) header")
        score_impact -= 5

    # 3. X-Frame-Options
    xfo = headers.get("x-frame-options")
    if xfo:
        header_grades["X-Frame-Options"] = f"Present ({xfo})"
        score_impact += 5
    else:
        header_grades["X-Frame-Options"] = "Missing"
        flags.append("Missing X-Frame-Options header (Clickjacking risk)")
        score_impact -= 5

    # 4. X-Content-Type-Options
    xcto = headers.get("x-content-type-options")
    if xcto:
        header_grades["X-Content-Type-Options"] = "Present (nosniff)"
        score_impact += 5
    else:
        header_grades["X-Content-Type-Options"] = "Missing"
        flags.append("Missing X-Content-Type-Options header (MIME-sniffing risk)")
        score_impact -= 5

    # 5. X-XSS-Protection
    xxss = headers.get("x-xss-protection")
    header_grades["X-XSS-Protection"] = xxss if xxss else "Missing"

    # 6. Permissions-Policy
    perm = headers.get("permissions-policy")
    header_grades["Permissions-Policy"] = "Present" if perm else "Missing"

    # Overall grade
    missing_count = sum(1 for status in header_grades.values() if status == "Missing")
    if missing_count <= 1:
        grade = "A"
    elif missing_count <= 3:
        grade = "B"
    elif missing_count <= 4:
        grade = "C"
    else:
        grade = "F"

    return {
        "header_grades": header_grades,
        "grade": grade,
        "missing_count": missing_count,
        "flags": flags,
        "score_impact": score_impact
    }
