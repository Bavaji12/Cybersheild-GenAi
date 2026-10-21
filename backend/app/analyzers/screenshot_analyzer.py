import re
from app.analyzers.message_analyzer import analyze_message
from app.analyzers.financial_analyzer import analyze_financial_threat

PHONE_REGEX = r"(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+91[-.\s]?[6-9]\d{9}"
URL_REGEX = r"https?://[^\s]+|[a-zA-Z0-9][-a-zA-Z0-9]*\.(?:com|org|net|xyz|top|buzz|cc|app|site|online)[^\s]*"
UPI_VPA_REGEX = r"[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}"

def analyze_screenshot_text(extracted_text: str, visual_cues: dict = None) -> dict:
    indicators = []
    evidence = {"extracted_text": extracted_text}
    
    # 1. Extract phone numbers
    phones = re.findall(PHONE_REGEX, extracted_text)
    evidence["extracted_phone_numbers"] = list(set(phones))
    
    # 2. Extract URLs
    urls = re.findall(URL_REGEX, extracted_text)
    evidence["extracted_urls"] = list(set(urls))
    
    # 3. Extract VPAs
    vpas = re.findall(UPI_VPA_REGEX, extracted_text)
    evidence["extracted_vpas"] = list(set(vpas))
    
    # 4. Run through message and financial analyzers
    msg_analysis = analyze_message(extracted_text)
    fin_analysis = analyze_financial_threat(extracted_text)
    
    # Take highest risk score
    highest_score = max(msg_analysis["risk_score"], fin_analysis["risk_score"])
    
    indicators.extend(msg_analysis["indicators"])
    indicators.extend(fin_analysis["indicators"])
    # Deduplicate indicators
    indicators = list(dict.fromkeys(indicators))
    
    if highest_score >= 80:
        level = "CRITICAL"
        category = "High-Risk Fraud / Impersonation Screenshot"
        explanation = "Extracted screenshot elements confirm bank impersonation, aggressive urgency, or fraudulent payment/credential requests."
    elif highest_score >= 50:
        level = "HIGH"
        category = "Suspicious Communication Screenshot"
        explanation = "Screenshot exhibits deceitful social engineering or unverified customer support lures."
    elif highest_score >= 25:
        level = "MEDIUM"
        category = "Unverified Interface Screenshot"
        explanation = "Moderate warning indicators found in the visual text."
    else:
        highest_score = 10.0
        level = "SAFE"
        category = "Benign Image Content"
        explanation = "No malicious financial demands, phishing lures, or credential requests detected in the screenshot."

    combined_prevention = list(dict.fromkeys(msg_analysis.get("preventive_actions", []) + fin_analysis.get("preventive_actions", [])))
    if not combined_prevention:
        combined_prevention = ["Always confirm transaction requests through official channels."]

    return {
        "extracted_text": extracted_text,
        "phone_numbers": evidence["extracted_phone_numbers"],
        "urls": evidence["extracted_urls"],
        "vpas": evidence["extracted_vpas"],
        "risk_score": highest_score,
        "risk_level": level,
        "threat_category": category,
        "indicators": indicators,
        "evidence": evidence,
        "explanation": explanation,
        "preventive_actions": combined_prevention,
        "is_malicious": highest_score >= 50
    }
