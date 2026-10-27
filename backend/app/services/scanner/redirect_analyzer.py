import urllib.parse
import httpx
from typing import Dict, Any, List

async def analyze_redirects(target_url: str) -> Dict[str, Any]:
    chain: List[Dict[str, str]] = []
    flags: List[str] = []
    score_impact = 0
    final_url = target_url
    has_infinite_loop = False
    cross_domain_redirects = 0

    if not target_url.startswith("http://") and not target_url.startswith("https://"):
        target_url = "https://" + target_url

    visited_urls = set()
    current_url = target_url

    try:
        async with httpx.AsyncClient(follow_redirects=False, timeout=5.0, verify=False) as client:
            step = 0
            max_hops = 10
            while step < max_hops:
                if current_url in visited_urls:
                    has_infinite_loop = True
                    flags.append("Infinite redirect loop detected")
                    score_impact -= 25
                    break
                visited_urls.add(current_url)
                
                try:
                    resp = await client.head(current_url)
                except Exception:
                    resp = await client.get(current_url)

                status_code = resp.status_code
                chain.append({
                    "hop": step + 1,
                    "url": current_url,
                    "status_code": status_code
                })

                if status_code in (301, 302, 303, 307, 308):
                    location = resp.headers.get("location")
                    if not location:
                        break
                    next_url = urllib.parse.urljoin(current_url, location)
                    
                    orig_host = urllib.parse.urlparse(current_url).hostname
                    next_host = urllib.parse.urlparse(next_url).hostname
                    if orig_host != next_host:
                        cross_domain_redirects += 1

                    current_url = next_url
                    step += 1
                else:
                    final_url = current_url
                    break

            if step >= max_hops:
                flags.append("Excessive redirect hops (>10 redirects)")
                score_impact -= 15

    except Exception:
        chain.append({"hop": 1, "url": target_url, "status_code": 0})

    if cross_domain_redirects > 1:
        flags.append(f"Multiple cross-domain redirects detected ({cross_domain_redirects} hops)")
        score_impact -= 15

    return {
        "redirect_chain": chain,
        "hop_count": len(chain),
        "final_destination": final_url,
        "has_infinite_loop": has_infinite_loop,
        "cross_domain_count": cross_domain_redirects,
        "flags": flags,
        "score_impact": score_impact
    }
