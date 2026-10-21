import re
from app.analyzers.url_analyzer import analyze_url

URGENCY_PATTERNS = [
    r"\b(immediately|urgent|within\s+\d+\s*(hours|hrs|mins|minutes)|blocked\s+today|suspended\s+today)\b",
    r"\b(act\s+now|last\s+chance|expires\s+soon|limited\s+time|final\s+notice)\b",
    r"\b(action\s+required|immediate\s+attention|without\s+delay)\b"
]

THREAT_PATTERNS = [
    r"\b(account\s+(will\s+be\s+)?(blocked|frozen|suspended|terminated|deactivated))\b",
    r"\b(legal\s+action|police|lawsuit|penalty|fine\s+of|arrest\s+warrant|court\s+order)\b",
    r"\b(electricity\s+power\s+cut|disconnection)\b"
]

FINANCIAL_SCAM_PATTERNS = [
    r"\b(kyc\s+(update|pending|mandatory|verification|suspended))\b",
    r"\b(pan\s+card\s+(update|link|expired|blocked))\b",
    r"\b(lottery|won\s+\$?\d+|reward\s+points|cashback\s+of|prize\s+money|congratulations\s+you\s+won)\b",
    r"\b(income\s+tax\s+refund|tax\s+rebate|credited\s+to\s+your\s+account)\b",
    r"\b(part\s*time\s*job|earn\s+\d+\s*(daily|per\s+day)|youtube\s+like\s+subscribe\s+job)\b"
]

CREDENTIAL_HARVESTING_PATTERNS = [
    r"\b(enter\s+(your\s+)?(password|pin|mpin|cvv|atm\s*pin|debit\s*card\s*number))\b",
    r"\b(share\s+(the\s+)?(otp|one\s*time\s*password|verification\s*code))\b",
    r"\b(do\s+not\s+share\s+otp\s+with\s+anyone\s+except)\b",
    r"\b(send\s+screenshot\s+of\s+qr|send\s+seed\s+phrase|private\s+key)\b"
]

IMPERSONATION_TARGETS = [
    ("State Bank of India (SBI)", r"\b(sbi|state\s+bank|yono)\b"),
    ("HDFC Bank", r"\b(hdfc|hdfcbank)\b"),
    ("ICICI Bank", r"\b(icici|imobile)\b"),
    ("Reserve Bank of India (RBI)", r"\b(rbi|reserve\s+bank)\b"),
    ("Income Tax Department", r"\b(income\s+tax|it\s+department|cbdt)\b"),
    ("Courier / Logistics (India Post/FedEx/DHL)", r"\b(india\s+post|fedex|dhl|bluedart|package\s+delivery\s+failed)\b"),
    ("Electricity Board", r"\b(electricity\s+bill|power\s+supply|bses|tneb|mseb)\b"),
    ("Netflix / Streaming", r"\b(netflix|prime\s+video|subscription\s+expired)\b")
]

URL_REGEX = r"https?://(?:[-\w.]|(?:%[\da-fA-F]{2}))+[^\s]*|[a-zA-Z0-9][-a-zA-Z0-9]*\.(?:com|org|net|xyz|top|buzz|cc|app|link|site|info)[^\s]*"

def analyze_message(text: str, sender: str = "") -> dict:
    indicators = []
    evidence = {}
    total_points = 0
    text_lower = text.lower()
    
    # 1. Check Urgency
    matched_urgency = []
    for pat in URGENCY_PATTERNS:
        matches = re.findall(pat, text_lower)
        if matches:
            matched_urgency.extend([m[0] if isinstance(m, tuple) else m for m in matches])
    evidence["urgency_triggers"] = matched_urgency
    if matched_urgency:
        total_points += 25
        indicators.append(f"Urgency-inducing pressure detected: '{matched_urgency[0]}'")

    # 2. Check Threatening / Intimidation language
    matched_threats = []
    for pat in THREAT_PATTERNS:
        matches = re.findall(pat, text_lower)
        if matches:
            matched_threats.extend([m[0] if isinstance(m, tuple) else m for m in matches])
    evidence["intimidation_triggers"] = matched_threats
    if matched_threats:
        total_points += 30
        indicators.append(f"Threat or intimidation pattern detected: '{matched_threats[0]}'")

    # 3. Check Financial Scam / KYC bait
    matched_financial = []
    for pat in FINANCIAL_SCAM_PATTERNS:
        matches = re.findall(pat, text_lower)
        if matches:
            matched_financial.extend([m[0] if isinstance(m, tuple) else m for m in matches])
    evidence["financial_lures"] = matched_financial
    if matched_financial:
        total_points += 30
        indicators.append(f"Financial lure or deceptive KYC demand detected: '{matched_financial[0]}'")

    # 4. Check Credential / OTP Harvesting
    matched_credentials = []
    for pat in CREDENTIAL_HARVESTING_PATTERNS:
        matches = re.findall(pat, text_lower)
        if matches:
            matched_credentials.extend([m[0] if isinstance(m, tuple) else m for m in matches])
    evidence["credential_requests"] = matched_credentials
    if matched_credentials:
        total_points += 40
        indicators.append("Direct solicitation for sensitive credentials, PIN, OTP, or passwords")

    # 5. Check Impersonation
    impersonated = []
    for name, pat in IMPERSONATION_TARGETS:
        if re.search(pat, text_lower):
            impersonated.append(name)
    evidence["impersonated_entities"] = impersonated
    if impersonated:
        total_points += 20
        indicators.append(f"Brand / Authority impersonation indicators for: {', '.join(impersonated)}")

    # 6. Extract and analyze embedded URLs
    found_urls = re.findall(URL_REGEX, text)
    evidence["extracted_urls"] = found_urls
    embedded_url_risk = 0
    analyzed_urls = []
    for u in found_urls:
        url_res = analyze_url(u)
        analyzed_urls.append(url_res)
        if url_res["risk_score"] > embedded_url_risk:
            embedded_url_risk = url_res["risk_score"]
        if url_res["risk_level"] in ["HIGH", "CRITICAL"]:
            indicators.append(f"Embedded malicious/suspicious link: {u} ({url_res['threat_category']})")

    evidence["url_analysis"] = analyzed_urls
    if embedded_url_risk >= 70:
        total_points += 35
    elif embedded_url_risk >= 40:
        total_points += 20
    elif found_urls:
        total_points += 10

    # 7. Check Sender anomalies if provided
    if sender:
        evidence["sender"] = sender
        if re.search(r"(\+92|\+1|\+44|@gmail\.com|@yahoo\.com)", sender) and impersonated:
            total_points += 25
            indicators.append(f"Official entity impersonation from irregular personal or foreign sender: {sender}")

    score = min(100.0, max(0.0, float(total_points)))

    if score >= 80:
        level = "CRITICAL"
        threat_type = "High-Risk Phishing / Social Engineering Scam"
        explanation = "Message contains aggressive social engineering markers designed to instill panic and coerce immediate compliance. High probability of credential theft or direct financial fraud."
        prevention = [
            "DO NOT click any link in the message.",
            "DO NOT reply or contact the provided phone number.",
            "NEVER share OTP, PIN, password, or banking credentials.",
            "Verify account status directly through the official bank app or branch."
        ]
    elif score >= 60:
        level = "HIGH"
        threat_type = "Suspected Smishing / Impersonation Message"
        explanation = "Message displays significant deceptive signals (e.g., brand claims combined with urgency or suspicious links). Likely designed to capture credentials or install malicious payloads."
        prevention = [
            "Do not follow instructions in the text.",
            "Block the sender number or report as spam.",
            "Check official website directly using a trusted browser bookmark."
        ]
    elif score >= 35:
        level = "MEDIUM"
        threat_type = "Unverified Promotional or Suspicious Message"
        explanation = "Contains promotional lures or unverified claims. Proceed with caution."
        prevention = [
            "Avoid sharing personal details.",
            "Be skeptical of unsolicited offers or warnings."
        ]
    elif score >= 15:
        level = "LOW"
        threat_type = "Low Risk Communication"
        explanation = "Minimal risk markers detected. Exercise standard situational awareness."
        prevention = ["Standard communication caution."]
    else:
        score = max(5.0, score)
        level = "SAFE"
        threat_type = "Standard / Benign Message"
        explanation = "No overt threats, extortion, phishing links, or credential requests detected."
        prevention = ["No defensive actions required."]

    return {
        "text": text,
        "risk_score": score,
        "risk_level": level,
        "threat_category": threat_type,
        "indicators": indicators,
        "evidence": evidence,
        "explanation": explanation,
        "preventive_actions": prevention,
        "is_malicious": score >= 60
    }
