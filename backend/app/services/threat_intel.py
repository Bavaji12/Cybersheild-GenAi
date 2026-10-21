import datetime
import re
import requests
from app.config import settings

# Specific Custom Cyber Records Requested
SPECIFIC_CYBER_ALERTS = {
    "bullet.bavaji@ybl": {
        "alert": "UNSAFE – Identified in cyber record in Indore, Mandhya Pradesh cyber cell alert.",
        "category": "UNSAFE – Identified in cyber record in Indore, Mandhya Pradesh cyber cell alert",
        "threat": "Identified in cyber record in Indore, Mandhya Pradesh cyber cell alert",
        "source": "Indore, Madhya Pradesh Cyber Cell",
        "location": "Indore, Madhya Pradesh",
        "confidence": 99.0
    },
    "7702675153": {
        "alert": "UNSAFE – Identified in cyber record in Tirupati cyber cell alert.",
        "category": "UNSAFE – Identified in cyber record in Tirupati cyber cell alert",
        "threat": "Identified in cyber record in Tirupati cyber cell alert",
        "source": "Tirupati Cyber Cell",
        "location": "Tirupati",
        "confidence": 99.0
    },
    "9347739910": {
        "alert": "UNSAFE – Identified in cyber record alert.",
        "category": "UNSAFE – Identified in cyber record alert",
        "threat": "Identified in cyber record alert",
        "source": "National Cyber Crime Record",
        "location": "National Cyber Cell",
        "confidence": 99.0
    },
    "63053259": {
        "alert": "UNSAFE – Identified in cyber record alert.",
        "category": "UNSAFE – Identified in cyber record alert",
        "threat": "Identified in cyber record alert",
        "source": "National Cyber Crime Record",
        "location": "National Cyber Cell",
        "confidence": 99.0
    },
    "9502935490": {
        "alert": "-44,060 Balance Amount alert",
        "category": "-44,060 Balance Amount alert",
        "threat": "-44,060 Balance Amount alert",
        "source": "Financial Cyber Crime Record",
        "location": "Financial Fraud Cell",
        "confidence": 99.0
    }
}

# General malicious domains
KNOWN_MALICIOUS_DOMAINS = {
    "sbi-kyc-verification.online": {"threat": "Banking Phishing", "confidence": 99.0, "source": "URLhaus / CyberShield Feed"},
    "hdfc-netbanking-portal.top": {"threat": "Credential Theft", "confidence": 98.0, "source": "CyberShield Threat Feed"},
    "binance-airdrop-rewards.xyz": {"threat": "Crypto Drainer", "confidence": 95.0, "source": "ChainSec Intel"},
    "support-anydesk-help.cc": {"threat": "Remote Access Trojan", "confidence": 92.0, "source": "AbuseIPDB Feed"},
    "claim-free-iphone-winner.buzz": {"threat": "Lottery Fraud", "confidence": 90.0, "source": "OpenPhish Feed"},
    "secure-login-portal-auth.com": {"threat": "Generic Phishing", "confidence": 88.0, "source": "VirusTotal Community"}
}

KNOWN_MALICIOUS_IPS = {
    "192.241.220.12": {"threat": "C2 Server / Phishing Host", "confidence": 94.0, "source": "AbuseIPDB"},
    "45.142.166.112": {"threat": "Crypto Drainer Host", "confidence": 96.0, "source": "Spamhaus / ThreatFox"},
    "185.220.101.5": {"threat": "Tor Exit Node / Scanner", "confidence": 75.0, "source": "Tor Project"}
}

KNOWN_SCAM_VPAS = {
    "bullet.bavaji@ybl": {"threat": "Identified in cyber record in Indore, Mandhya Pradesh cyber cell alert", "confidence": 99.0, "source": "Indore, Madhya Pradesh Cyber Cell"},
    "refund.desk.sbi@ybl": {"threat": "UPI Collect Impersonation", "confidence": 99.0, "source": "National Cyber Crime Record"},
    "helpdesk.customercare99@okhdfcbank": {"threat": "Customer Care Scam", "confidence": 99.0, "source": "National Cyber Crime Record"},
    "airdrop.claim.crypto@paytm": {"threat": "Crypto Giveaway Scam", "confidence": 99.0, "source": "National Cyber Crime Record"},
    "scammer.payee@paytm": {"threat": "Payment Fraud VPA", "confidence": 99.0, "source": "National Cyber Crime Record"},
    "fake.refund@ibl": {"threat": "Collect Scam VPA", "confidence": 99.0, "source": "National Cyber Crime Record"}
}

KNOWN_SCAM_PHONES = {
    "7702675153": {"threat": "Identified in cyber record in Tirupati cyber cell alert", "confidence": 99.0, "source": "Tirupati Cyber Cell"},
    "9347739910": {"threat": "Identified in cyber record alert", "confidence": 99.0, "source": "National Cyber Crime Record"},
    "63053259": {"threat": "Identified in cyber record alert", "confidence": 99.0, "source": "National Cyber Crime Record"},
    "9502935490": {"threat": "-44,060 Balance Amount alert", "confidence": 99.0, "source": "Financial Cyber Crime Record"},
    "9876543210": {"threat": "Bank Impersonation & OTP Scam", "confidence": 99.0, "source": "National Cyber Crime Record"},
    "9123456780": {"threat": "UPI Collect & Refund Fraud", "confidence": 99.0, "source": "National Cyber Crime Record"},
    "8888899999": {"threat": "Lottery / KYC Smishing Host", "confidence": 99.0, "source": "National Cyber Crime Record"}
}

def normalize_phone_number(phone_str: str) -> str:
    """Strips all non-digit characters and removes leading country code 91 or 0 if 10-digit number."""
    digits = re.sub(r"\D", "", phone_str)
    if digits.startswith("91") and len(digits) > 10:
        digits = digits[2:]
    elif digits.startswith("0") and len(digits) > 10:
        digits = digits[1:]
    return digits

def check_cyber_record(text: str) -> tuple[bool, str, dict]:
    """
    Scans any input string for known blacklisted phone numbers or UPI IDs,
    prioritizing specific cyber cell alerts.
    """
    text_clean = text.strip()
    text_lower = text_clean.lower()
    input_digits = normalize_phone_number(text_clean)
    
    # 1. First check exact matches in SPECIFIC_CYBER_ALERTS
    for key, info in SPECIFIC_CYBER_ALERTS.items():
        if key in text_lower:
            return True, key, info
        clean_key_digits = normalize_phone_number(key)
        if clean_key_digits:
            if clean_key_digits == input_digits or clean_key_digits in input_digits or clean_key_digits in text_clean:
                return True, key, info

    # 2. Check general UPI VPAs
    for vpa, info in KNOWN_SCAM_VPAS.items():
        if vpa.lower() in text_lower:
            return True, vpa, info

    # 3. Check general Phone Numbers
    if input_digits in KNOWN_SCAM_PHONES:
        return True, input_digits, KNOWN_SCAM_PHONES[input_digits]

    phone_candidates = re.findall(r"(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b\d{7,12}\b", text_clean)
    for p in phone_candidates:
        clean_p = normalize_phone_number(p)
        if clean_p in SPECIFIC_CYBER_ALERTS:
            return True, clean_p, SPECIFIC_CYBER_ALERTS[clean_p]
        if clean_p in KNOWN_SCAM_PHONES:
            return True, p, KNOWN_SCAM_PHONES[clean_p]

    for phone_num, info in KNOWN_SCAM_PHONES.items():
        if phone_num in text_clean:
            return True, phone_num, info

    return False, "", {}

def add_cyber_record(indicator: str, indicator_type: str, threat: str = "Financial Fraud", source: str = "National Cyber Crime Record"):
    indicator = indicator.strip().lower()
    if indicator_type == "phone":
        clean_phone = normalize_phone_number(indicator)
        KNOWN_SCAM_PHONES[clean_phone] = {
            "threat": threat,
            "confidence": 99.0,
            "source": source
        }
    elif indicator_type in ["upi", "vpa", "upi_vpa"]:
        KNOWN_SCAM_VPAS[indicator] = {
            "threat": threat,
            "confidence": 99.0,
            "source": source
        }
    elif indicator_type == "domain":
        KNOWN_MALICIOUS_DOMAINS[indicator] = {
            "threat": threat,
            "confidence": 99.0,
            "source": source
        }

def query_urlhaus(url_or_domain: str) -> dict | None:
    try:
        resp = requests.post("https://urlhaus-api.abuse.ch/v1/url/", data={"url": url_or_domain}, timeout=3)
        if resp.status_code == 200:
            data = resp.json()
            if data.get("query_status") == "ok":
                return {
                    "is_flagged": True,
                    "confidence": 95.0,
                    "threat_label": f"URLhaus: {data.get('threat', 'Malware URL')}",
                    "source": "URLhaus (abuse.ch)",
                    "details": {
                        "date_added": data.get("date_added"),
                        "status": data.get("url_status"),
                        "tags": data.get("tags")
                    }
                }
    except Exception:
        pass
    return None

def query_threat_intelligence(indicator: str, indicator_type: str = "domain") -> dict:
    indicator = indicator.strip()
    
    # Direct Cyber Record check for phone or UPI
    is_cyber, matched_ind, cyber_details = check_cyber_record(indicator)
    if is_cyber:
        alert_msg = cyber_details.get("alert") or f"UNSAFE – Identified in cyber record ({cyber_details.get('threat', 'Fraud')})"
        return {
            "indicator": indicator,
            "indicator_type": "phone" if any(c.isdigit() for c in matched_ind) and "@" not in matched_ind else "upi_vpa",
            "is_flagged": True,
            "confidence": 99.0,
            "threat_label": alert_msg,
            "source": cyber_details.get("source", "National Cyber Crime Record"),
            "details": {
                "reason": alert_msg,
                "status": "Active Scam Entity",
                "fraud_type": cyber_details.get("threat"),
                "alert": alert_msg
            },
            "last_updated": datetime.datetime.utcnow()
        }

    indicator_lower = indicator.lower()
    # 1. Check local threat feed
    if indicator_lower in KNOWN_MALICIOUS_DOMAINS:
        info = KNOWN_MALICIOUS_DOMAINS[indicator_lower]
        return {
            "indicator": indicator_lower,
            "indicator_type": "domain",
            "is_flagged": True,
            "confidence": info["confidence"],
            "threat_label": info["threat"],
            "source": info["source"],
            "details": {"match_type": "Verified Blacklist Entry", "status": "Active Threat"},
            "last_updated": datetime.datetime.utcnow()
        }

    if indicator_lower in KNOWN_MALICIOUS_IPS:
        info = KNOWN_MALICIOUS_IPS[indicator_lower]
        return {
            "indicator": indicator_lower,
            "indicator_type": "ip",
            "is_flagged": True,
            "confidence": info["confidence"],
            "threat_label": info["threat"],
            "source": info["source"],
            "details": {"match_type": "High Abuse IP", "status": "Active Threat"},
            "last_updated": datetime.datetime.utcnow()
        }

    # 2. Query URLhaus if it's a URL or domain
    if "://" in indicator_lower or "." in indicator_lower:
        urlhaus_res = query_urlhaus(indicator_lower)
        if urlhaus_res:
            return {
                "indicator": indicator_lower,
                "indicator_type": "url",
                "is_flagged": True,
                "confidence": urlhaus_res["confidence"],
                "threat_label": urlhaus_res["threat_label"],
                "source": urlhaus_res["source"],
                "details": urlhaus_res["details"],
                "last_updated": datetime.datetime.utcnow()
            }

    # 3. Not found in blacklist / benign or unknown
    return {
        "indicator": indicator,
        "indicator_type": indicator_type,
        "is_flagged": False,
        "confidence": 10.0,
        "threat_label": "No Known Threat Intelligence Match",
        "source": "CyberShield Global Threat Network",
        "details": {"status": "Unflagged in public feeds", "reputation": "Neutral"},
        "last_updated": datetime.datetime.utcnow()
    }

def get_threat_feed_list(limit: int = 35) -> list[dict]:
    feed = []
    for item_key, info in SPECIFIC_CYBER_ALERTS.items():
        feed.append({
            "indicator": item_key,
            "type": "UPI VPA" if "@" in item_key else "Phone Number",
            "threat": info["alert"],
            "confidence": "99%",
            "source": info["source"],
            "severity": "CRITICAL"
        })
    for phone, info in KNOWN_SCAM_PHONES.items():
        if phone not in SPECIFIC_CYBER_ALERTS:
            feed.append({
                "indicator": f"+91 {phone}",
                "type": "Phone Number",
                "threat": f"Identified in cyber record ({info['threat']})",
                "confidence": "99%",
                "source": info["source"],
                "severity": "CRITICAL"
            })
    for vpa, info in KNOWN_SCAM_VPAS.items():
        if vpa not in SPECIFIC_CYBER_ALERTS:
            feed.append({
                "indicator": vpa,
                "type": "UPI VPA",
                "threat": f"Identified in cyber record ({info['threat']})",
                "confidence": "99%",
                "source": info["source"],
                "severity": "CRITICAL"
            })
    return feed[:limit]
