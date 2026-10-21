import re
from urllib.parse import parse_qs, urlparse
from app.services.threat_intel import check_cyber_record

# UPI regex & keywords
UPI_VPA_REGEX = r"[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}"
UPI_URI_REGEX = r"upi://pay\?[^\s]+"

UPI_COLLECT_SCAM_PATTERNS = [
    r"\b(enter\s*(your\s*)?(upi\s*)?pin\s*to\s*(receive|get|claim|credit|refund))\b",
    r"\b(scan\s*(this\s*)?qr\s*to\s*(receive|get|credit|claim))\b",
    r"\b(money\s*(sent|transferred)\s*by\s*mistake|please\s*return|refund\s*my\s*money)\b",
    r"\b(requesting\s*money|collect\s*request|approve\s*request\s*to\s*get)\b"
]

BANKING_SCAM_PATTERNS = [
    r"\b(dear\s*customer|dear\s*user|valued\s*customer)\b.*\b(account\s*blocked|kyc\s*suspended|pan\s*not\s*linked)\b",
    r"\b(credit\s*card\s*(points|reward|limit\s*increase|cashback\s*pending))\b",
    r"\b(pre-approved\s*loan|instant\s*loan\s*without\s*cibil|processing\s*fee\s*required)\b",
    r"\b(apk\s*download|install\s*bank\s*support\s*app|anydesk|teamviewer|rustdesk|quicksupport)\b"
]

CRYPTO_SCAM_PATTERNS = [
    r"\b(guaranteed\s*(returns|profit|roi)|100%\s*(safe|profit)|no\s*risk\s*investment)\b",
    r"\b(send\s*\d+\s*(eth|btc|sol|usdt)\s*(and\s*)?get\s*\d+|double\s*your\s*(crypto|bitcoin|funds))\b",
    r"\b(airdrop\s*claim|claim\s*free\s*(tokens|crypto|nft)|wallet\s*draining|connect\s*wallet\s*now)\b",
    r"\b(seed\s*phrase|12\s*words|secret\s*recovery\s*phrase|private\s*key|mnemonic)\b",
    r"\b(telegram\s*crypto\s*expert|whatsapp\s*vip\s*trading\s*group|forex\s*automated\s*bot)\b"
]

def analyze_upi_uri(uri: str) -> dict:
    parsed = urlparse(uri)
    params = parse_qs(parsed.query)
    vpa = params.get("pa", [""])[0]
    name = params.get("pn", [""])[0]
    amount = params.get("am", [""])[0]
    note = params.get("tn", [""])[0]
    
    indicators = []
    points = 0
    
    # Check if VPA is in cyber crime records
    is_cyber, matched_ind, cyber_info = check_cyber_record(vpa)
    if is_cyber:
        points = 100
        indicators.append(f"Identified in cyber record: Payee VPA ({vpa}) matches confirmed fraud registry entry ({cyber_info.get('threat', 'Fraud')})")
    else:
        if vpa:
            # Check suspicious VPA handles
            if any(h in vpa.lower() for h in ["helpdesk", "refund", "support", "kyc", "customer"]):
                points += 35
                indicators.append(f"Deceptive UPI VPA handle mimicking support/refund: {vpa}")
            if any(bank in vpa.lower() for bank in ["sbi", "hdfc", "paytm", "gpay"]) and not vpa.endswith(("@okhdfcbank", "@oksbi", "@paytm", "@ibl", "@ybl")):
                points += 25
                indicators.append(f"Potential spoofed bank moniker in personal VPA: {vpa}")
            
    if note:
        for pat in UPI_COLLECT_SCAM_PATTERNS:
            if re.search(pat, note.lower()):
                points += 40
                indicators.append(f"Scam phrasing in UPI transaction note: '{note}'")
                
    return {
        "vpa": vpa,
        "payee_name": name,
        "amount": amount,
        "note": note,
        "points": points,
        "indicators": indicators
    }

def analyze_financial_threat(text: str, context_type: str = "general") -> dict:
    indicators = []
    evidence = {}
    points = 0
    text_lower = text.lower()
    detected_subtype = "Unknown Financial Vector"

    # 0. DIRECT CYBER RECORD CHECK (Phone Numbers & UPI IDs)
    is_cyber, matched_ind, cyber_details = check_cyber_record(text)
    if is_cyber:
        points = 100
        alert_str = cyber_details.get("alert") or f"UNSAFE – Identified in cyber record alert."
        detected_subtype = alert_str
        indicators.append(alert_str)
        evidence["cyber_record_match"] = {
            "matched_indicator": matched_ind,
            "threat": cyber_details.get("threat"),
            "source": cyber_details.get("source"),
            "status": "Identified in cyber record",
            "alert": alert_str
        }

    # 1. UPI Collect & Reverse Scams
    upi_scam_matches = []
    for pat in UPI_COLLECT_SCAM_PATTERNS:
        match = re.search(pat, text_lower)
        if match:
            upi_scam_matches.append(match.group(0))
    evidence["upi_collect_scam_matches"] = upi_scam_matches
    if upi_scam_matches:
        points = max(points, 60)
        detected_subtype = "UPI Collect / Reverse Payment Scam"
        indicators.append("Deceptive claim that entering a PIN or scanning a QR will credit money to you (PIN IS ONLY FOR SENDING MONEY)")

    # 2. UPI VPAs and URIs
    vpas = re.findall(UPI_VPA_REGEX, text)
    evidence["detected_vpas"] = vpas
    for vpa in vpas:
        is_vpa_cyber, _, vpa_info = check_cyber_record(vpa)
        if is_vpa_cyber:
            points = 100
            indicators.append(f"Identified in cyber record: UPI VPA '{vpa}' is blacklisted for fraud")

    if "upi://" in text:
        uris = re.findall(UPI_URI_REGEX, text)
        for u in uris:
            uri_res = analyze_upi_uri(u)
            points = max(points, uri_res["points"])
            indicators.extend(uri_res["indicators"])
            evidence["upi_uri_analysis"] = uri_res

    # 3. Banking Fraud & Remote Access Scams
    bank_matches = []
    for pat in BANKING_SCAM_PATTERNS:
        match = re.search(pat, text_lower)
        if match:
            bank_matches.append(match.group(0))
    evidence["banking_scam_matches"] = bank_matches
    if bank_matches:
        points = max(points, 55)
        if not is_cyber:
            detected_subtype = "Banking Impersonation / KYC Scam"
        indicators.append("Banking urgency or remote access software promotion (e.g. AnyDesk/QuickSupport) detected")

    # 4. Crypto Scams & Seed Phrase Theft
    crypto_matches = []
    for pat in CRYPTO_SCAM_PATTERNS:
        match = re.search(pat, text_lower)
        if match:
            crypto_matches.append(match.group(0))
    evidence["crypto_scam_matches"] = crypto_matches
    if crypto_matches:
        points = max(points, 60)
        if not is_cyber:
            detected_subtype = "Cryptocurrency Fraud / Seed Phrase Theft"
        if any(term in text_lower for term in ["seed phrase", "secret recovery phrase", "private key"]):
            points = 100
            indicators.append("EXTREME DANGER: Request for cryptocurrency 12/24-word seed recovery phrase (Guaranteed wallet theft)")
        if any(term in text_lower for term in ["guaranteed", "double your", "100% profit"]):
            indicators.append("Unrealistic guaranteed return scheme / Ponzi claim detected")

    # If identified in cyber record, guarantee CRITICAL score (98/100)
    if is_cyber:
        score = 98.0
        level = "CRITICAL"
        alert_str = cyber_details.get("alert") or f"UNSAFE – Identified in cyber record alert."
        explanation = alert_str
        preventive_actions = [
            f"DO NOT SEND ANY MONEY: {alert_str}",
            "DO NOT ENTER YOUR UPI PIN OR APPROVE COLLECT REQUESTS.",
            "DO NOT SHARE OTP, BANK DETAILS, OR CALL BACK THIS PHONE NUMBER.",
            "Block this contact immediately and report to the cyber cell."
        ]
    else:
        score = min(100.0, max(0.0, float(points)))
        if score >= 80:
            level = "CRITICAL"
            explanation = f"Critical financial threat identified ({detected_subtype}). Direct attempts to induce monetary transfer, steal UPI authorization PINs, or extract private cryptocurrency keys."
            preventive_actions = [
                "DO NOT ENTER YOUR UPI PIN: Entering a PIN deducts money from your account, it NEVER receives funds.",
                "DO NOT CONNECT CRYPTO WALLET OR SHARE SEED PHRASE.",
                "DO NOT INSTALL remote access apps (AnyDesk, TeamViewer, QuickSupport).",
                "Block the sender and report to national cybercrime portal (e.g., cybercrime.gov.in or local fraud authority)."
            ]
        elif score >= 55:
            level = "HIGH"
            explanation = f"High probability financial scam detected ({detected_subtype}). Exploits financial urgency or dubious reward offers to solicit funds or sensitive payment details."
            preventive_actions = [
                "Verify all claims directly via official bank telephone banking or in-app support.",
                "Never make payments to personal VPAs for official company services.",
                "Ignore unverified lottery or cashback promises."
            ]
        elif score >= 30:
            level = "MEDIUM"
            explanation = "Suspicious financial communication containing promotional lure or unverified transaction note."
            preventive_actions = [
                "Double-check recipient identity before authorizing any payment.",
                "Avoid clicking financial links in unprompted messages."
            ]
        else:
            score = max(5.0, score)
            level = "SAFE"
            explanation = "No overt financial fraud, UPI theft, or crypto drainer patterns identified."
            preventive_actions = ["Standard financial vigilance applies."]

    return {
        "text": text,
        "risk_score": score,
        "risk_level": level,
        "threat_category": detected_subtype if score >= 30 else "Normal Financial Communication",
        "indicators": indicators,
        "evidence": evidence,
        "explanation": explanation,
        "preventive_actions": preventive_actions,
        "is_malicious": score >= 55
    }
