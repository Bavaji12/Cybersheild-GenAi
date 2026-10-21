from urllib.parse import urlparse
from app.analyzers.url_analyzer import analyze_url
from app.analyzers.financial_analyzer import analyze_financial_threat

def analyze_qr_payload(decoded_text: str) -> dict:
    decoded_text = decoded_text.strip()
    indicators = []
    evidence = {"raw_payload": decoded_text}
    
    # 1. Determine payload type
    if decoded_text.startswith("upi://pay"):
        payload_type = "UPI Payment QR Code"
        financial_analysis = analyze_financial_threat(decoded_text)
        risk_score = financial_analysis["risk_score"]
        risk_level = financial_analysis["risk_level"]
        threat_category = f"UPI QR Threat - {financial_analysis['threat_category']}"
        indicators.extend(financial_analysis["indicators"])
        explanation = f"QR code encodes a direct UPI payment request. {financial_analysis['explanation']}"
        prevention = financial_analysis["preventive_actions"] + [
            "REMINDER: Scanning a QR code is strictly for SENDING money, NEVER for receiving money or prizes."
        ]
        evidence["payment_data"] = financial_analysis["evidence"]

    elif decoded_text.startswith("http://") or decoded_text.startswith("https://") or any(decoded_text.endswith(ext) for ext in [".com", ".net", ".xyz", ".top", ".org", ".io"]):
        payload_type = "Web URL QR Code"
        url_analysis = analyze_url(decoded_text)
        risk_score = url_analysis["risk_score"]
        risk_level = url_analysis["risk_level"]
        threat_category = f"QR Destination: {url_analysis['threat_category']}"
        indicators.extend(url_analysis["indicators"])
        explanation = f"QR code encodes an external web URL: {url_analysis['url']}. {url_analysis['explanation']}"
        prevention = [
            f"Do not open this destination: {decoded_text}",
            url_analysis["recommendation"]
        ]
        evidence["url_data"] = url_analysis["evidence"]

    elif decoded_text.startswith("WIFI:"):
        payload_type = "Wi-Fi Configuration QR"
        risk_score = 25.0
        risk_level = "LOW"
        threat_category = "Wi-Fi Network Setup"
        explanation = "QR code contains Wi-Fi access credentials. Verify the physical location before connecting."
        prevention = ["Do not connect to untrusted public Wi-Fi networks without an active VPN."]

    else:
        payload_type = "Plain Text / Custom QR"
        fin = analyze_financial_threat(decoded_text)
        risk_score = fin["risk_score"]
        risk_level = fin["risk_level"]
        threat_category = "Generic QR Payload"
        indicators.extend(fin["indicators"])
        explanation = "QR code contains plain text or unstructured data."
        prevention = ["Review extracted content carefully before interacting."]

    return {
        "decoded_content": decoded_text,
        "payload_type": payload_type,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "threat_category": threat_category,
        "indicators": indicators,
        "evidence": evidence,
        "explanation": explanation,
        "preventive_actions": prevention,
        "is_malicious": risk_score >= 50
    }
