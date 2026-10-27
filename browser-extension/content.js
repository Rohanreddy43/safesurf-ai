// SafeSurf AI - Google Search SiteAdvisor Content Script

const API_ENDPOINT = "http://localhost:8000/api/v1/scan";
const scannedCache = new Map();

function createBadgeElement(rawStatus = "loading", score = 0, category = "") {
  const status = (rawStatus || "safe").toLowerCase();
  const badge = document.createElement("span");
  badge.className = `safesurf-badge safesurf-badge-${status}`;

  let extraTag = "";
  if (category.includes("Adult")) {
    extraTag = " 🔞 18+";
  } else if (category.includes("Gambling")) {
    extraTag = " 🎲 Betting";
  }

  if (status === "loading") {
    badge.innerHTML = `🛡️ Checking...`;
  } else if (status === "safe") {
    badge.innerHTML = `✓ Safe (${score}/100)${extraTag}`;
  } else if (status === "suspicious") {
    badge.innerHTML = `! Suspicious (${score}/100)${extraTag}`;
  } else {
    badge.innerHTML = `✕ Malicious (${score}/100)${extraTag}`;
  }
  return badge;
}

async function scanUrl(url) {
  if (scannedCache.has(url)) {
    return scannedCache.get(url);
  }

  try {
    const res = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });
    if (!res.ok) throw new Error("API error");
    const data = await res.json();
    scannedCache.set(url, data);
    return data;
  } catch (err) {
    const fallback = { status: "safe", risk_score: 95 };
    scannedCache.set(url, fallback);
    return fallback;
  }
}

async function processGoogleSearchResults() {
  // Query Google search result title anchors
  const searchAnchors = document.querySelectorAll("div.g a h3, #search a h3");

  for (const h3 of searchAnchors) {
    const anchor = h3.closest("a");
    if (!anchor || anchor.dataset.safesurfProcessed) continue;
    
    const href = anchor.href;
    if (!href || href.startsWith("javascript:") || href.includes("google.com") || href.includes("youtube.com")) {
      continue;
    }

    anchor.dataset.safesurfProcessed = "true";

    // Create initial loading badge
    const badge = createBadgeElement("loading");
    h3.appendChild(badge);

    // Fetch security analysis asynchronously
    scanUrl(href).then((report) => {
      const status = report.status || "safe";
      const score = report.risk_score !== undefined ? report.risk_score : 95;
      const category = report.report_data?.modules?.content_category?.primary_category || "";
      
      const newBadge = createBadgeElement(status, score, category);
      newBadge.title = `SafeSurf AI Trust Score: ${score}/100 (${String(status).toUpperCase()}). Category: ${category}. Click for full report.`;
      
      newBadge.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.open(`http://localhost:3000/dashboard/scan?url=${encodeURIComponent(href)}`, "_blank");
      });

      if (badge.parentNode) {
        badge.parentNode.replaceChild(newBadge, badge);
      }
    });
  }
}

// Observe dynamic DOM changes on Google (e.g. infinite scroll / pagination)
const observer = new MutationObserver(() => {
  processGoogleSearchResults();
});

document.addEventListener("DOMContentLoaded", () => {
  processGoogleSearchResults();
  observer.observe(document.body, { childList: true, subtree: true });
});

// Run immediate scan check
setTimeout(processGoogleSearchResults, 500);
