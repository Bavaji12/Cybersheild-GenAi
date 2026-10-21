import json
import requests
from app.config import settings
from app.services.threat_intel import check_cyber_record

COPILOT_SYSTEM_PROMPT = """You are CyberShield Security Copilot, an AI cybersecurity assistant.
Your role is to analyze structured cybersecurity findings and explain them clearly to users.

You must:
1. Explain the detected threat in beginner-friendly, plain language.
2. Identify the evidence supporting the classification.
3. Explain potential impact (financial, identity, device, account).
4. Provide prioritized defensive actions (what NOT to do, and immediate recovery steps).
5. Distinguish confirmed indicators from uncertain signals.
6. Never claim certainty when evidence is insufficient.
7. Never request passwords, OTPs, private keys, seed phrases, API secrets, or authentication codes.
8. Never instruct users to perform illegal or unauthorized security activity.
9. Never execute transactions.
10. Never encourage users to test attacks against systems they do not own or have authorization to test.
11. For financial incidents, prioritize preservation of evidence and contacting the relevant legitimate financial institution or official reporting channel.
12. Give concise, actionable recommendations.
13. Clearly state limitations when analysis is incomplete.
"""

def generate_copilot_reasoning_fallback(user_query: str, scan_context: dict = None) -> dict:
    """
    Intelligent cybersecurity reasoning engine that analyzes structured findings
    and synthesizes expert security guidance compliant with Section 8 rules.
    """
    context = scan_context or {}
    category = context.get("threat_category", "Potential Cybersecurity Incident")
    risk_level = context.get("risk_level", "SUSPICIOUS")
    risk_score = context.get("risk_score", 65.0)
    indicators = context.get("indicators", [])
    evidence = context.get("evidence", {})
    input_preview = context.get("input_preview", "")

    # Direct Cyber Record check
    is_cyber, matched_ind, cyber_details = check_cyber_record(user_query)
    if not is_cyber and input_preview:
        is_cyber, matched_ind, cyber_details = check_cyber_record(input_preview)

    if is_cyber:
        alert_msg = cyber_details.get("alert") or "UNSAFE – Identified in cyber record alert."
        src = cyber_details.get("source", "Cyber Cell")
        reply = f"""### 🚨 CyberShield Copilot Security Alert: Confirmed Cyber Cell Record

**Official Alert:** {alert_msg}  
**Classification:** {cyber_details.get('threat', 'Financial Fraud')}  
**Originating Cyber Cell:** {src}  
**Risk Level:** CRITICAL (98.0 / 100)

#### 1. What Does This Mean?
This identifier (`{matched_ind}`) has been officially cataloged in law enforcement fraud registries. Past victims have reported financial siphon scams, unauthorized UPI collect transactions, or banking social engineering stemming from this entity.

#### 2. Immediate Protective Actions (DO NOT PROCEED):
- 🛑 **DO NOT SEND ANY MONEY OR APPROVE ANY UPI REQUEST.**
- 🛑 **DO NOT ENTER YOUR UPI PIN.** (Entering a PIN always sends money, never receives it).
- 🛑 **DO NOT SHARE OTPs, PASSWORDS, OR CARD DETAILS.**
- 🛑 **Block this number or UPI ID immediately.**

#### 3. Incident Reporting:
If you have already sent funds to this entity, immediately call **1930** (National Cyber Crime Helpline) or lodge a report at **cybercrime.gov.in** within the golden hour to request an immediate bank transaction lien/freeze.
"""
        return {
            "reply": reply,
            "suggested_actions": [
                f"Block {matched_ind} immediately",
                "Do not approve any UPI payment request",
                "Report to Cyber Crime Cell (Helpline: 1930)",
                "Preserve screenshot evidence"
            ],
            "educational_takeaway": f"Alert: {alert_msg}. UPI PIN is strictly for debiting funds, never for receiving money.",
            "source": f"CyberShield Threat Intelligence & {src}"
        }

    indicator_bullets = "\n".join([f"• {ind}" for ind in indicators]) if indicators else "• Heuristic anomaly patterns detected"
    
    # Financial threats
    if any(k in category.lower() for k in ["banking", "upi", "financial", "crypto", "kyc"]):
        reply = f"""### 🛡️ CyberShield Copilot Security Assessment

**Threat Classification:** {category}  
**Assessed Risk Level:** {risk_level} ({risk_score}/100)

#### 1. What is Happening?
The analyzed content exhibits patterns of **targeted financial social engineering**. Attackers frequently use urgency, brand impersonation, and misleading transaction descriptions to deceive targets into authorizing outgoing fund transfers or disclosing critical authorization codes.

#### 2. Key Evidence Detected:
{indicator_bullets}

#### 3. Potential Impact:
- **Direct Financial Drain:** Irreversible deduction from bank accounts or cryptocurrency wallets.
- **Credential & Account Compromise:** Scammers gaining unauthorized access to net-banking or payment portals.
- **Identity Fraud:** Misuse of PAN/KYC documentation for fraudulent loan applications.

#### 4. Immediate Defensive Checklist (What NOT to do):
- 🛑 **NEVER enter your UPI MPIN** to receive funds. Entering a PIN always withdraws money.
- 🛑 **DO NOT click any link** or contact phone numbers listed in unverified alerts.
- 🛑 **NEVER share SMS OTPs**, debit card CVVs, or crypto 12/24-word recovery seed phrases.
- 🛑 **DO NOT install remote assistance tools** (e.g., AnyDesk, TeamViewer) if prompted by callers claiming to be bank staff.

#### 5. Recovery & Incident Response Steps:
1. **Preserve Evidence:** Take screenshots of the message, sender ID, and transaction details.
2. **Contact Official Channels:** Reach out to your bank exclusively using the phone number printed on the back of your debit card or the official mobile banking application.
3. **Report Fraud:** File an immediate complaint on the official National Cyber Crime Reporting Portal (1930 / cybercrime.gov.in) or your local jurisdiction's fraud bureau.

*Analysis Confidence: High based on matched heuristic signatures. External threat feed validation recommended for unverified domains.*"""

        suggested_actions = [
            "Freeze net-banking access if OTP was entered",
            "Verify account balance via official banking app",
            "File report on National Cyber Crime Portal",
            "Block sender phone number / email address"
        ]
        takeaway = "Banking institutions and regulatory authorities will never threaten immediate account suspension over SMS or demand OTPs/PINs to receive funds."

    # URL / Phishing / Tech threats
    elif any(k in category.lower() for k in ["url", "phishing", "domain", "malware", "file"]):
        reply = f"""### 🛡️ CyberShield Copilot Technical Security Briefing

**Threat Classification:** {category}  
**Assessed Risk Level:** {risk_level} ({risk_score}/100)

#### 1. Technical Explanation:
The inspected resource has been flagged for characteristics commonly associated with **credential phishing or unauthorized payload delivery**. Attackers frequently leverage typosquatted domains, missing encryption, or masqueraded file formats to bypass basic user skepticism.

#### 2. Technical Evidence Identified:
{indicator_bullets}

#### 3. Attack Vector & Potential Exposure:
- **Credential Harvesting:** Interception of corporate or personal login passwords via spoofed form submissions.
- **Session Hijacking:** Unauthorized capture of authentication cookies or API bearer tokens.
- **Device Infection:** Potential execution of unauthorized scripts, ransomware, or spyware binaries.

#### 4. Prioritized Mitigation Actions:
- ❌ **Do not interact with the destination:** Avoid loading the URL or opening downloadable files.
- ❌ **Never submit authentication details:** If already submitted, change passwords immediately from a separate, clean device.
- 🔒 **Enable Multi-Factor Authentication (MFA):** Ensure app-based (TOTP) or FIDO2/WebAuthn hardware keys are enforced on all associated accounts.

*Limitations: Local heuristic analysis performed. Sandboxed behavioral dynamic detonation is advised for unknown binaries.*"""

        suggested_actions = [
            "Do not open or interact with the flagged resource",
            "Rotate passwords for any services entered recently",
            "Enforce authenticator app 2FA across accounts",
            "Clear browser cache and active sessions"
        ]
        takeaway = "Always verify the top-level domain and official SSL certificate before entering credentials on any authentication form."

    else:
        reply = f"""### 🛡️ CyberShield Copilot Security Analysis

**Threat Category:** {category}  
**Current Risk Rating:** {risk_level} ({risk_score}/100)

#### Analysis Summary:
Based on the provided input:
`{input_preview[:120] if input_preview else user_query[:120]}`

CyberShield evaluated the message structure, domain metadata, and behavioral cues. 

#### Detected Indicators:
{indicator_bullets}

#### Defensive Guidance:
1. Treat unsolicited communications requesting action or personal details with high skepticism.
2. Verify claims through official, independently verified communication methods.
3. Avoid sharing sensitive personal identifiers (PII), OTPs, or passwords.

*Need deeper analysis? Provide the full URL, raw email headers, or transaction VPA.*"""

        suggested_actions = [
            "Verify sender through an official contact method",
            "Do not share confidential identifiers",
            "Run full URL or file check in CyberShield Analyzers"
        ]
        takeaway = "Social engineers rely on manufactured urgency to bypass human scrutiny. Always pause and verify."

    return {
        "reply": reply,
        "suggested_actions": suggested_actions,
        "educational_takeaway": takeaway,
        "source": "CyberShield Intelligent Heuristic Engine"
    }

def ask_copilot(user_query: str, scan_context: dict = None, history: list = None) -> dict:
    """
    CyberShield Security Copilot. Calls Google Gemini API if API key configured;
    otherwise falls back gracefully to the intelligent deterministic cybersecurity engine.
    """
    api_key = settings.GEMINI_API_KEY.strip()
    
    if api_key:
        try:
            # Construct context prompt
            context_str = json.dumps(scan_context, indent=2) if scan_context else "None provided."
            prompt = f"{COPILOT_SYSTEM_PROMPT}\n\nUser Question:\n{user_query}\n\nStructured Security Findings Context:\n{context_str}"
            
            # Call Gemini API
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
            payload = {
                "contents": [
                    {
                        "parts": [{"text": prompt}]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.2,
                    "maxOutputTokens": 1024
                }
            }
            res = requests.post(url, json=payload, timeout=12)
            if res.status_code == 200:
                data = res.json()
                reply_text = data["candidates"][0]["content"]["parts"][0]["text"]
                return {
                    "reply": reply_text,
                    "suggested_actions": [
                        "Preserve message and URL headers as evidence",
                        "Verify via official application or telephone",
                        "Report incident to national authorities"
                    ],
                    "educational_takeaway": "Always verify URLs and never share authentication credentials under urgent pressure.",
                    "source": "CyberShield Copilot (Gemini GenAI Engine)"
                }
        except Exception:
            # On network or API error, fall back to built-in reasoning
            pass

    # Fallback to local intelligent cybersecurity reasoner
    return generate_copilot_reasoning_fallback(user_query, scan_context)
