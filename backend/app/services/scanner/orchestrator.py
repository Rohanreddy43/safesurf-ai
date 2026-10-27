import asyncio
import time
import urllib.parse
import requests
from typing import Dict, Any

from app.services.scanner.url_validator import analyze_url
from app.services.scanner.dns_lookup import analyze_dns
from app.services.scanner.whois_lookup import analyze_whois
from app.services.scanner.ssl_inspector import analyze_ssl
from app.services.scanner.hosting_info import analyze_hosting
from app.services.scanner.redirect_analyzer import analyze_redirects
from app.services.scanner.html_analyzer import analyze_html
from app.services.scanner.headers_analyzer import analyze_headers
from app.services.scanner.threat_intel import analyze_threat_intel
from app.services.scanner.content_classifier import analyze_content_category

# Specialized Engines
from app.services.scanner.crawler_engine import analyze_crawler
from app.services.scanner.visual_similarity import analyze_visual_similarity
from app.services.scanner.js_analyzer import analyze_javascript
from app.services.scanner.ssl_dns_intelligence import summarize_infrastructure_intelligence
from app.services.scanner.behavioral_sandbox import analyze_behavioral_sandbox
from app.services.scanner.ai_vision_engine import analyze_ai_vision
from app.services.scanner.favicon_hash import analyze_favicon_hash
from app.services.scanner.site_legitimacy import analyze_site_legitimacy
from app.services.scanner.phishing_kit_fingerprint import analyze_phishing_kit_fingerprint
from app.services.scanner.community_threat import analyze_community_threat
from app.services.scanner.ai_risk_engine import calculate_ai_risk

def fetch_html_safe(url: str) -> str:
    try:
        resp = requests.get(url, timeout=3.5, headers={"User-Agent": "Mozilla/5.0 (SafeSurfBot/1.0)"})
        return resp.text
    except Exception:
        return ""

async def run_full_scan(raw_url: str) -> Dict[str, Any]:
    start_time = time.time()
    
    if not raw_url.startswith("http://") and not raw_url.startswith("https://"):
        formatted_url = "https://" + raw_url
    else:
        formatted_url = raw_url

    parsed = urllib.parse.urlparse(formatted_url)
    hostname = parsed.hostname or raw_url.split("/")[0]

    # Fetch HTML once for DOM inspection engines
    html_content = await asyncio.to_thread(fetch_html_safe, formatted_url)

    # Launch non-blocking parallel tasks
    url_task = asyncio.to_thread(analyze_url, formatted_url)
    dns_task = asyncio.to_thread(analyze_dns, hostname)
    whois_task = asyncio.to_thread(analyze_whois, hostname)
    ssl_task = asyncio.to_thread(analyze_ssl, hostname)
    hosting_task = analyze_hosting(hostname)
    redirect_task = analyze_redirects(formatted_url)
    html_task = analyze_html(formatted_url)
    headers_task = analyze_headers(formatted_url)
    threat_task = analyze_threat_intel(hostname, formatted_url)
    category_task = asyncio.to_thread(analyze_content_category, hostname, formatted_url)

    # Advanced Security Engines
    crawler_task = asyncio.to_thread(analyze_crawler, formatted_url, html_content)
    visual_task = asyncio.to_thread(analyze_visual_similarity, formatted_url, html_content)
    js_task = asyncio.to_thread(analyze_javascript, html_content)
    vision_task = asyncio.to_thread(analyze_ai_vision, formatted_url, html_content)
    favicon_task = asyncio.to_thread(analyze_favicon_hash, formatted_url, html_content)
    legitimacy_task = asyncio.to_thread(analyze_site_legitimacy, formatted_url, html_content)
    kit_task = asyncio.to_thread(analyze_phishing_kit_fingerprint, html_content)
    community_task = asyncio.to_thread(analyze_community_threat, hostname)

    (
        url_res,
        dns_res,
        whois_res,
        ssl_res,
        hosting_res,
        redirect_res,
        html_res,
        headers_res,
        threat_res,
        category_res,
        crawler_res,
        visual_res,
        js_res,
        vision_res,
        favicon_res,
        legitimacy_res,
        kit_res,
        community_res
    ) = await asyncio.gather(
        url_task,
        dns_task,
        whois_task,
        ssl_task,
        hosting_task,
        redirect_task,
        html_task,
        headers_task,
        threat_task,
        category_task,
        crawler_task,
        visual_task,
        js_task,
        vision_task,
        favicon_task,
        legitimacy_task,
        kit_task,
        community_task,
        return_exceptions=False
    )

    # Compute Infrastructure & Sandbox Synthesis
    infra_res = summarize_infrastructure_intelligence(ssl_res, dns_res, whois_res, hosting_res)
    sandbox_res = analyze_behavioral_sandbox(formatted_url, redirect_res, html_content)

    # Compute Unified AI Risk Engine
    ai_risk_res = calculate_ai_risk(
        url_res=url_res,
        dns_res=dns_res,
        whois_res=whois_res,
        ssl_res=ssl_res,
        hosting_res=hosting_res,
        redirect_res=redirect_res,
        html_res=html_res,
        headers_res=headers_res,
        threat_res=threat_res,
        category_res=category_res,
        crawler_res=crawler_res,
        visual_res=visual_res,
        js_res=js_res,
        infra_res=infra_res,
        sandbox_res=sandbox_res,
        vision_res=vision_res,
        favicon_res=favicon_res,
        legitimacy_res=legitimacy_res,
        kit_res=kit_res,
        community_res=community_res
    )

    execution_time = round(time.time() - start_time, 2)

    return {
        "target_url": formatted_url,
        "domain": hostname,
        "execution_time_seconds": execution_time,
        "risk_score": ai_risk_res["final_score"],
        "status": ai_risk_res["status"],
        "summary": ai_risk_res["explanation"],
        "modules": {
            # Advanced Security Engine Suite
            "crawler_engine": crawler_res,
            "url_validation": url_res,
            "threat_intelligence": threat_res,
            "visual_similarity": visual_res,
            "js_analysis": js_res,
            "html_security": html_res,
            "ssl_dns_intelligence": infra_res,
            "behavioral_sandbox": sandbox_res,
            "ai_vision_engine": vision_res,
            "favicon_hash": favicon_res,
            "site_legitimacy": legitimacy_res,
            "phishing_kit": kit_res,
            "community_threat": community_res,
            "ai_risk_engine": ai_risk_res,
            
            # Supporting Technical Modules
            "dns": dns_res,
            "whois": whois_res,
            "ssl": ssl_res,
            "hosting": hosting_res,
            "redirects": redirect_res,
            "security_headers": headers_res,
            "content_category": category_res
        }
    }
