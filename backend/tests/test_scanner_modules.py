import pytest
from app.services.scanner.dns_lookup import analyze_dns
from app.services.scanner.whois_lookup import analyze_whois
from app.services.scanner.headers_analyzer import analyze_headers
from app.services.scanner.ai_risk_engine import calculate_ai_risk

def test_dns_lookup():
    res = analyze_dns("google.com")
    assert "records" in res
    assert "A" in res["records"]

def test_whois_lookup():
    res = analyze_whois("google.com")
    assert "registrar" in res

@pytest.mark.asyncio
async def test_headers_analyzer():
    res = await analyze_headers("https://google.com")
    assert "grade" in res
    assert "header_grades" in res

def test_ai_risk_engine():
    url_res = {"is_https": True, "typosquatting_detected": False, "is_ip": False, "has_punycode": False}
    dns_res = {"has_a_record": True}
    whois_res = {"domain_age_days": 2000}
    ssl_res = {"valid": True, "issuer": "Let's Encrypt", "is_self_signed": False}
    hosting_res = {}
    redirect_res = {"has_infinite_loop": False, "cross_domain_count": 0}
    html_res = {"findings": {"hidden_iframes": 0, "crypto_miners": False}}
    headers_res = {"grade": "A"}
    threat_res = {"flagged_count": 0}

    res = calculate_ai_risk(
        url_res, dns_res, whois_res, ssl_res, hosting_res,
        redirect_res, html_res, headers_res, threat_res
    )
    assert res["final_score"] >= 80
    assert res["status"] == "Safe"
    assert "Trust Score" in res["explanation"]
