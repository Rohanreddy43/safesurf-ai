# SafeSurf AI 🛡️ - Website Security & Phishing Detection Platform

**SafeSurf AI** is a production-ready, full-stack cybersecurity platform inspired by VirusTotal, URLScan, and Google Safe Browsing. It analyzes any website URL in real-time across 10 distinct security inspection modules, generates dynamic risk trust scores (0–100), and provides human-readable plain-English AI explanations.

---

## 🌟 Key Features & 10 Security Inspection Modules

1. **URL & Typosquatting Validation**: Checks for Unicode/homograph attacks, raw IP-based URLs, punycode characters, and computes Levenshtein distances against major global brand domains (Google, PayPal, Apple, Chase, etc.).
2. **DNS Record Resolution**: Resolves A, AAAA, MX, TXT, NS, and CNAME records while checking for SPF authentication.
3. **WHOIS & Domain Age Audit**: Computes domain age, registrar details, and penalizes newly created domains (< 30 days old).
4. **SSL/TLS Inspector**: Validates certificate chains, expiry dates, issuer organization, TLS protocol versions, and self-signed flags.
5. **Hosting & Geolocation**: Resolves target IP addresses, country, city, ASN, ISP, and geographic coordinates.
6. **Redirect Flow Analysis**: Tracing HTTP redirect hop chains, cross-domain redirects, and infinite loop traps.
7. **Static HTML DOM Security**: Detects hidden zero-pixel iframes, unencrypted password submit forms, obfuscated JS scripts, base64 script tags, and browser crypto miners.
8. **Security Headers Auditor**: Evaluates CSP, Strict-Transport-Security (HSTS), X-Frame-Options, X-Content-Type-Options, and assigns letter grades (A–F).
9. **Multi-Source Threat Intelligence**: Integrates checks across VirusTotal, Google Safe Browsing, OpenPhish, PhishTank, and AbuseIPDB.
10. **AI Risk Engine & Plain-English Explanations**: Synthesizes a weighted trust score (0-100) with detailed risk vector breakdowns and an interactive AI chatbot assistant.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Framer Motion, Recharts, Lucide Icons.
- **Backend**: Python FastAPI, SQLAlchemy Async, SQLite / PostgreSQL, PyJWT, Passlib (Bcrypt), BeautifulSoup4, ReportLab (PDF Export).
- **Deployment & DevOps**: Docker, Docker Compose, GitHub Actions CI/CD.

---

## 🚀 Quick Start Guide

### 1. Run Backend (FastAPI)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
- API Swagger Docs: `http://localhost:8000/docs`

### 2. Run Frontend (Next.js 15)
```bash
cd frontend
npm install
npm run dev
```
- Web Platform: `http://localhost:3000`

---

## 🐳 Docker Deployment

```bash
docker-compose up --build
```

---

## 🧪 Testing

### Run Backend Pytest Suite
```bash
cd backend
pytest
```

---

## 🔌 REST API Endpoints

- `POST /api/v1/scan`: Run URL scan report
- `GET /api/v1/report/{id}`: Retrieve report by ID
- `GET /api/v1/history`: Retrieve scan history
- `GET /api/v1/export/pdf/{id}`: Download professional PDF report
- `GET /api/v1/export/csv`: Export history CSV
- `POST /api/v1/auth/register`: Register new user
- `POST /api/v1/auth/login`: Authenticate & obtain JWT
- `POST /api/v1/apikeys`: Generate developer API key

---

## 🧩 Browser Extension

Load the manifest in Chrome via `chrome://extensions` -> `Load unpacked` -> Select `browser-extension/` directory.
