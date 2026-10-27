import re
import urllib.parse
from typing import Dict, Any, List
import requests
from bs4 import BeautifulSoup

COMMON_LOGIN_PATHS = [
    "/login", "/signin", "/auth", "/admin", "/account",
    "/wp-login.php", "/portal", "/bank", "/verify", "/checkpoint",
    "/user/login", "/secure/login"
]

def analyze_crawler(formatted_url: str, html_content: str = "") -> Dict[str, Any]:
    """
    Website Crawling & Discovery Engine
    Discovers hidden login pages, forms, and malicious sub-routes or external action targets.
    """
    parsed = urllib.parse.urlparse(formatted_url)
    base_domain = parsed.netloc
    scheme = parsed.scheme or "https"

    discovered_routes = []
    hidden_login_pages = []
    form_endpoints = []
    external_action_targets = []
    
    if not html_content:
        try:
            resp = requests.get(formatted_url, timeout=4, headers={"User-Agent": "Mozilla/5.0 (SafeSurfBot/1.0)"})
            html_content = resp.text
        except Exception:
            html_content = ""

    if html_content:
        soup = BeautifulSoup(html_content, "html.parser")
        
        # 1. Inspect all <a> links
        for a_tag in soup.find_all("a", href=True):
            href = a_tag["href"].strip()
            if not href or href.startswith("#") or href.startswith("javascript:"):
                continue
            
            full_url = urllib.parse.urljoin(formatted_url, href)
            parsed_href = urllib.parse.urlparse(full_url)
            
            if parsed_href.netloc == base_domain:
                if full_url not in discovered_routes:
                    discovered_routes.append(full_url)
                    path = parsed_href.path.lower()
                    if any(lp in path for lp in COMMON_LOGIN_PATHS):
                        hidden_login_pages.append(full_url)
            else:
                if full_url not in external_action_targets:
                    external_action_targets.append(full_url)

        # 2. Inspect all <form> actions
        for form in soup.find_all("form"):
            action = form.get("action", "").strip()
            method = form.get("method", "GET").upper()
            
            if action:
                full_action = urllib.parse.urljoin(formatted_url, action)
                form_endpoints.append({
                    "action": full_action,
                    "method": method,
                    "is_external": urllib.parse.urlparse(full_action).netloc != base_domain
                })

    crawled_count = len(discovered_routes)
    
    return {
        "status": "completed",
        "discovered_routes_count": crawled_count,
        "discovered_routes": discovered_routes[:15],
        "hidden_login_pages": hidden_login_pages,
        "form_endpoints": form_endpoints,
        "external_action_targets": external_action_targets[:10],
        "has_hidden_login_portal": len(hidden_login_pages) > 0,
        "has_external_form_posts": any(f["is_external"] for f in form_endpoints)
    }
