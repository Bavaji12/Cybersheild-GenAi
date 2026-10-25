Live Link:https://cybersheild-gen-ai.vercel.app/
# CyberShield – GenAI

> **An Intelligent Cybersecurity Platform Unifying Financial Fraud Prevention, Technology Threat Analysis, Unified Risk Scoring, and GenAI Copilot.**

---

## 1. Project Vision & Core Philosophy

**CyberShield – GenAI** is an advanced, defensive cybersecurity platform designed to protect users across two critical domains:
1. **Financial Cybersecurity**: UPI fraud, bank impersonation, QR collect scams, and cryptocurrency wallet drainers.
2. **Technology Cybersecurity**: Credential phishing, malware file extensions, plaintext secret exposure, and IoT vulnerabilities.

The platform follows a strict, non-linear defensive lifecycle:

$$\text{DETECT} \longrightarrow \text{ANALYZE} \longrightarrow \text{EXPLAIN} \longrightarrow \text{ASSESS RISK} \longrightarrow \text{PREVENT} \longrightarrow \text{RESPOND}$$

Unlike generic chatbots, the **CyberShield Security Copilot** consumes structured security telemetry and produces prioritized, deterministic defensive checklists and actionable guidance.

---

## 2. Key Modules & Features

| Module | Feature | Capability |
|---|---|---|
| **Module 1** | User Authentication & RBAC | JWT token authentication, bcrypt hashing, role separation (`user`, `admin`), and Multi-Factor Authentication (MFA) toggle. |
| **Module 2** | Cybersecurity Command Dashboard | Animated SVG Risk Gauge (0–100), financial vs. tech risk breakdown, 7-day threat trend charts, and real-time alert feed. |
| **Module 3** | Financial Cybersecurity Engine | Analyzes UPI collect requests, payment reversal bait, fake bank KYC messages, and crypto seed-phrase theft. |
| **Module 4** | Technology Cybersecurity Engine | Phishing link inspector, executable/double-extension malware detection, data leak/secret scanner, and IoT posture auditor. |
| **Module 5** | GenAI Cybersecurity Copilot | Context-aware AI assistant powered by Google Gemini API with native heuristic cybersecurity fallback reasoning. |
| **Module 6** | Unified AI Risk Scoring Engine | Multi-factor weighted composite scoring: URL reputation (20%), Message semantics (20%), Domain analysis (15%), Financial indicators (20%), Threat intel (15%), User context (10%). |
| **Module 7** | Personal Cyber Risk Profile | Tracks 5 security pillars: Financial Security, Account Security, Phishing Protection, Device Security, and Privacy Protection. |
| **Module 8** | Attack Chain & Kill-Chain Analyzer | Visualizes multi-stage cyber attack progression with MITRE ATT&CK kill-chain interception points. |
| **Module 9** | Incident Response System | Triage questionnaire (credentials entered? OTP shared? payment made?) generating prioritized containment checklists. |
| **Module 10** | Threat Intelligence Exchange | Queries verified blacklists, URLhaus, and local threat feeds for domains, IPs, and fraudulent UPI VPAs. |
| **Module 11–14** | Multi-Input Threat Analyzers | URL, Email/SMS smishing, QR code payload decoder, and screenshot OCR forensic text analysis. |
| **Module 15** | Forensic Report Generator | Instant export of audit-grade incident reports in PDF (via ReportLab) and structured JSON. |
| **Module 16–17** | Security Awareness & AI Scam Academy | Educational modules and interactive quizzes on Phishing, UPI scams, and Generative AI voice-cloning deepfakes. |
| **Module 18** | Admin Security Command Center | Aggregated, privacy-preserving threat telemetry, system health metrics, and audit log streams. |

---

## 3. Technology Stack

- **Backend**: Python 3.13, FastAPI, SQLAlchemy ORM, Uvicorn, Python-Jose (JWT), Bcrypt, ReportLab (PDF), Pydantic v2.
- **Frontend**: React 19, Vite, Lucide Icons, Custom Cyberpunk Glassmorphic Dark Design System (Vanilla CSS with Google Orbitron & Inter fonts).
- **Database**: SQLite (PostgreSQL compatible with SQLAlchemy).
- **AI / Reasoning**: Google Gemini API (`gemini-2.0-flash` compatible) with deterministic fallback rule engine.

---

## 4. Default Demo Accounts

Both accounts are pre-seeded in the database:

- **Standard User**:
  - Email: `user@cybershield.ai`
  - Password: `CyberShield2026!`
- **Security Administrator**:
  - Email: `admin@cybershield.ai`
  - Password: `AdminShield2026!`

*(1-Click Demo buttons are also available on the `/login` screen).*

---

## 5. Running Locally

### Backend
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
- API Documentation (Swagger): [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Health Check: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

### Frontend
```bash
cd frontend
npm install
npm run dev
```
- Web Application: [http://127.0.0.1:5173/](http://127.0.0.1:5173/)

---

## 6. Security Principles & Safety Boundaries

1. **Defensive Only**: The platform never performs offensive exploitation, password cracking, or unauthorized network scanning.
2. **Safe Code Handling**: Files and binaries are never executed. Inspections analyze metadata, hashes, and extensions.
3. **No Automatic Transactions**: UPI and payment indicators are analyzed strictly in memory; transactions are never initiated.
4. **Data Minimization**: Leaked secrets, passwords, and private tokens are masked with asterisks before output or database logging.
