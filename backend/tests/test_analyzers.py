import pytest
from app.analyzers.url_analyzer import analyze_url
from app.analyzers.message_analyzer import analyze_message
from app.analyzers.financial_analyzer import analyze_financial_threat
from app.analyzers.tech_analyzer import analyze_data_leak, analyze_file_metadata
from app.services.risk_engine import compute_unified_risk_score

def test_url_analyzer_malicious():
    res = analyze_url("http://sbi-netbanking-verify.xyz/login.php?user=admin")
    assert res["risk_score"] >= 60
    assert res["risk_level"] in ["HIGH", "CRITICAL"]
    assert any("impersonation" in ind.lower() or "tld" in ind.lower() or "http" in ind.lower() for ind in res["indicators"])

def test_url_analyzer_safe():
    res = analyze_url("https://www.google.com/search?q=cybersecurity")
    assert res["risk_score"] <= 35
    assert res["risk_level"] in ["SAFE", "LOW"]

def test_message_analyzer_banking_scam():
    text = "Dear Customer, Your SBI account will be blocked today. Update your KYC immediately at http://sbi-kyc.top or legal action will be taken."
    res = analyze_message(text)
    assert res["risk_score"] >= 70
    assert res["risk_level"] in ["HIGH", "CRITICAL"]
    assert len(res["indicators"]) >= 2

def test_financial_analyzer_upi_scam():
    text = "You won Rs 10000 cashback! Scan this QR code and enter your UPI PIN to claim money into your account."
    res = analyze_financial_threat(text)
    assert res["risk_score"] >= 80
    assert res["risk_level"] == "CRITICAL"
    assert "UPI PIN" in res["explanation"]

def test_tech_analyzer_secret_leak():
    secret_text = "AWS_SECRET = 'AKIAIOSFODNN7EXAMPLE'; please do not share."
    res = analyze_data_leak(secret_text)
    assert res["risk_score"] >= 30
    assert any(f["type"] == "AWS Access Key" for f in res["findings"])

def test_tech_analyzer_file_malware():
    res = analyze_file_metadata("invoice_receipt.pdf.exe")
    assert res["risk_score"] >= 80
    assert "Double extension" in str(res["indicators"])

def test_unified_risk_engine():
    score, level, breakdown = compute_unified_risk_score(
        url_reputation_score=90.0,
        message_indicators_score=85.0,
        domain_analysis_score=80.0,
        financial_indicators_score=95.0,
        user_context_score=10.0,
        threat_intel_score=95.0
    )
    assert score >= 85.0
    assert level == "CRITICAL"
    assert breakdown.url_reputation == 90.0
