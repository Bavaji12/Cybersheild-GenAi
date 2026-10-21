import re
from urllib.parse import urlparse
import math

HIGH_RISK_TLDS = {
    ".xyz", ".top", ".buzz", ".monster", ".work", ".click", ".fit", ".rest",
    ".tk", ".ml", ".ga", ".cf", ".gq", ".cc", ".su", ".cam", ".shop"
}

SUSPICIOUS_KEYWORDS = [
    "login", "signin", "verify", "verification", "secure", "security", "update",
    "account", "banking", "kyc", "wallet", "support", "authenticate", "confirm",
    "free", "bonus", "claim", "airdrop", "reward", "password", "recovery", "sbi",
    "hdfc", "icici", "paypal", "metamask", "binance", "coinbase"
]

TARGET_BRANDS = [
    "paypal", "google", "microsoft", "apple", "amazon", "netflix", "facebook",
    "instagram", "whatsapp", "sbi", "hdfc", "icici", "axis", "pnb", "chase",
    "wellsfargo", "binance", "metamask", "coinbase", "telegram", "twitter"
]

def calculate_entropy(text: str) -> float:
    """Calculate Shannon entropy to detect algorithmically generated domains (DGA)."""
    if not text:
        return 0.0
    entropy = 0.0
    length = len(text)
    counts = {}
    for char in text:
        counts[char] = counts.get(char, 0) + 1
    for count in counts.values():
        p = count / length
        entropy -= p * math.log2(p)
    return round(entropy, 2)

def analyze_url(url: str) -> dict:
    url = url.strip()
    if not url.startswith("http://") and not url.startswith("https://"):
        # prepend https to parse properly
        parsed = urlparse("https://" + url)
        has_original_protocol = False
    else:
        parsed = urlparse(url)
        has_original_protocol = True

    domain = parsed.hostname or ""
    path = parsed.path or ""
    query = parsed.query or ""
    
    indicators = []
    evidence = {}
    url_risk_points = 0

    # 1. Protocol check
    is_https = parsed.scheme.lower() == "https"
    evidence["protocol"] = parsed.scheme.upper() if parsed.scheme else "HTTP"
    if not is_https:
        url_risk_points += 20
        indicators.append("Insecure HTTP protocol (no encryption)")
    else:
        evidence["is_https"] = True

    # 2. IP address as domain
    is_ip = bool(re.match(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$", domain))
    evidence["is_ip_domain"] = is_ip
    if is_ip:
        url_risk_points += 40
        indicators.append(f"Domain is a raw IP address ({domain}) commonly used in malicious servers")

    # 3. Punycode / Homograph attack check
    is_punycode = "xn--" in domain.lower()
    evidence["is_punycode"] = is_punycode
    if is_punycode:
        url_risk_points += 35
        indicators.append("Punycode / Homograph encoding detected (potential lookalike spoofing)")

    # 4. TLD Risk Check
    matched_tld = None
    for tld in HIGH_RISK_TLDS:
        if domain.lower().endswith(tld):
            matched_tld = tld
            break
    evidence["high_risk_tld"] = matched_tld
    if matched_tld:
        url_risk_points += 20
        indicators.append(f"High-abuse top-level domain detected ({matched_tld})")

    # 5. Excessive Subdomains or Subdomain Spoofing
    subdomain_parts = domain.split(".")
    subdomain_count = len(subdomain_parts)
    evidence["subdomain_count"] = subdomain_count
    if subdomain_count >= 4:
        url_risk_points += 20
        indicators.append(f"Excessive subdomains ({subdomain_count} parts) suggesting multi-level masquerading")

    # 6. Brand Impersonation / Typosquatting in Subdomains or Path
    detected_brands = []
    for brand in TARGET_BRANDS:
        # Check if brand appears in subdomain or domain with hyphens (e.g., sbi-bank-verify.com)
        if brand in domain.lower():
            root_domain = ".".join(subdomain_parts[-2:]) if subdomain_count >= 2 else domain
            if not root_domain.startswith(brand + "."):
                detected_brands.append(brand)
    
    evidence["targeted_brands"] = detected_brands
    if detected_brands:
        url_risk_points += 35
        indicators.append(f"Targeted brand impersonation detected for: {', '.join(detected_brands)}")

    # 7. Suspicious Keywords in Path/Query/Domain
    found_keywords = []
    full_target_str = (domain + path + query).lower()
    for kw in SUSPICIOUS_KEYWORDS:
        if kw in full_target_str:
            found_keywords.append(kw)
    
    evidence["suspicious_keywords"] = found_keywords
    if len(found_keywords) >= 3:
        url_risk_points += 30
        indicators.append(f"Multiple high-risk security keywords found: {', '.join(found_keywords[:5])}")
    elif len(found_keywords) >= 1:
        url_risk_points += 15
        indicators.append(f"Security-sensitive keywords found in URL: {', '.join(found_keywords)}")

    # 8. Excessive URL length or special characters
    evidence["length"] = len(url)
    if len(url) > 100:
        url_risk_points += 15
        indicators.append(f"Unusually long URL ({len(url)} chars) indicating URL obfuscation")
    if "@" in url:
        url_risk_points += 30
        indicators.append("Credential delimiter '@' present in URL string (redirect trick)")

    # 9. DGA Domain Entropy
    domain_entropy = calculate_entropy(domain)
    evidence["domain_entropy"] = domain_entropy
    if domain_entropy > 3.8 and len(domain) > 12:
        url_risk_points += 20
        indicators.append(f"High algorithmic entropy ({domain_entropy}) - suspected automated domain generation (DGA)")

    # 10. Non-standard ports
    if parsed.port and parsed.port not in [80, 443, 8080]:
        url_risk_points += 20
        indicators.append(f"Non-standard web port detected: {parsed.port}")

    # Determine risk score (capped 0 - 100)
    score = min(100.0, max(0.0, float(url_risk_points)))
    
    if score >= 80:
        level = "CRITICAL"
        category = "High-Confidence Malicious URL / Phishing"
        explanation = f"URL demonstrates severe malicious indicators including {', '.join(indicators[:2]) if indicators else 'untrusted heuristics'}. Highly dangerous to visit or enter data."
        recommendation = "DO NOT open this link or enter any personal credentials or passwords."
    elif score >= 60:
        level = "HIGH"
        category = "Suspicious Phishing / Social Engineering Link"
        explanation = f"URL exhibits several anomalous properties consistent with credential harvesting or deceptive redirects: {', '.join(indicators[:3])}."
        recommendation = "Do not enter credentials. Verify via legitimate direct bookmark or official search."
    elif score >= 35:
        level = "MEDIUM"
        category = "Potentially Unwanted or Risky URL"
        explanation = "URL contains suspicious keywords or structure that warrant caution before interacting."
        recommendation = "Proceed with caution. Verify the domain identity before submitting any information."
    elif score >= 15:
        level = "LOW"
        category = "Low Risk URL"
        explanation = "Minor warnings detected (e.g. HTTP protocol or keywords), but domain appears standard."
        recommendation = "Ensure SSL padlock is active before entering any account details."
    else:
        score = max(5.0, score)
        level = "SAFE"
        category = "Standard Web URL"
        explanation = "No overt malicious patterns, brand spoofing, or obfuscation detected."
        recommendation = "Link appears standard. Standard cyber hygiene always applies."

    return {
        "url": url,
        "domain": domain,
        "risk_score": score,
        "risk_level": level,
        "threat_category": category,
        "indicators": indicators,
        "evidence": evidence,
        "explanation": explanation,
        "recommendation": recommendation,
        "is_malicious": score >= 60
    }
