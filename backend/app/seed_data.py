import json
import datetime
from sqlalchemy.orm import Session
from app import models
from app.auth import get_password_hash

def seed_database(db: Session):
    # Check if admin already exists
    existing_admin = db.query(models.User).filter(models.User.email == "admin@cybershield.ai").first()
    if existing_admin:
        return  # already seeded

    print("Seeding CyberShield database with demo accounts, threat feeds, and forensic scan telemetry...")

    # 1. Admin User
    admin = models.User(
        email="admin@cybershield.ai",
        username="admin",
        hashed_password=get_password_hash("AdminShield2026!"),
        full_name="Chief Security Officer",
        role="admin",
        is_active=True,
        mfa_enabled=True,
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=30),
        last_login=datetime.datetime.utcnow()
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)

    admin_profile = models.UserSecurityProfile(
        user_id=admin.id,
        overall_score=94.0,
        financial_security=95.0,
        account_security=98.0,
        phishing_protection=92.0,
        device_security=95.0,
        privacy_protection=90.0,
        total_scans_performed=128,
        threats_prevented=42,
        high_risk_interactions=1,
        recommendations_json=json.dumps([
            "Maintain hardware security key for admin authentication",
            "Periodically review tenant API token rotations"
        ])
    )
    db.add(admin_profile)

    # 2. Regular Demo User
    demo_user = models.User(
        email="user@cybershield.ai",
        username="demouser",
        hashed_password=get_password_hash("CyberShield2026!"),
        full_name="Alex Morgan",
        role="user",
        is_active=True,
        mfa_enabled=False,
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=15),
        last_login=datetime.datetime.utcnow()
    )
    db.add(demo_user)
    db.commit()
    db.refresh(demo_user)

    demo_profile = models.UserSecurityProfile(
        user_id=demo_user.id,
        overall_score=68.5,
        financial_security=72.0,
        account_security=65.0,
        phishing_protection=58.0,
        device_security=75.0,
        privacy_protection=72.0,
        total_scans_performed=18,
        threats_prevented=9,
        high_risk_interactions=2,
        recommendations_json=json.dumps([
            "Enable Multi-Factor Authentication (MFA) on your primary accounts",
            "Be cautious with unsolicited SMS asking to link PAN card",
            "Complete the UPI & QR Code Awareness Quiz"
        ])
    )
    db.add(demo_profile)

    # 3. Realistic Pre-loaded Scans
    scans_data = [
        {
            "scan_type": "email",
            "input_preview": "Dear Customer, Your SBI account will be blocked today. Complete KYC immediately: http://sbi-kyc-verification.online",
            "risk_score": 92.5,
            "risk_level": "CRITICAL",
            "threat_category": "Banking Phishing / KYC Scam",
            "is_malicious": True,
            "indicators": [
                "Targeted brand impersonation (State Bank of India)",
                "Extreme urgency cue ('blocked today')",
                "Deceptive KYC demand",
                "High-abuse top-level domain (.online)"
            ],
            "explanation": "High-confidence bank phishing attempt. Fraudsters use urgency and fake KYC requirements to steal net-banking credentials and capture 2FA SMS tokens.",
            "actions": [
                "DO NOT open the link or enter banking credentials.",
                "Verify account standing strictly via official SBI YONO app or bank branch.",
                "Report SMS to 1930 / cybercrime.gov.in."
            ]
        },
        {
            "scan_type": "financial",
            "input_preview": "Congratulations! You have received a cashback refund of Rs 4,999. Scan this QR code or enter your UPI PIN to credit your bank account.",
            "risk_score": 95.0,
            "risk_level": "CRITICAL",
            "threat_category": "UPI Collect / Reverse Payment Scam",
            "is_malicious": True,
            "indicators": [
                "Deceptive claim that entering PIN receives money",
                "Lottery / cashback lure ($4,999)",
                "High-pressure financial request"
            ],
            "explanation": "CRITICAL SCAM: Fraudsters claim you must scan a QR code or input your UPI PIN to claim money. Entering a PIN will immediately DEDUCT money from your bank account.",
            "actions": [
                "NEVER enter your UPI PIN to receive money.",
                "Decline any incoming collect requests.",
                "Block the fraudster on WhatsApp / payment app."
            ]
        },
        {
            "scan_type": "url",
            "input_preview": "https://binance-airdrop-rewards.xyz/claim?ref=bonus",
            "risk_score": 88.0,
            "risk_level": "CRITICAL",
            "threat_category": "Crypto Drainer / Fake Airdrop",
            "is_malicious": True,
            "indicators": [
                "Cryptocurrency exchange impersonation (Binance)",
                "High-risk top-level domain (.xyz)",
                "Suspicious promotional keywords ('airdrop', 'claim', 'bonus')"
            ],
            "explanation": "Malicious crypto phishing website designed to request malicious smart contract permissions (Permit2/unlimited allowance) to drain connected Web3 wallets.",
            "actions": [
                "DO NOT connect any crypto wallet (MetaMask, Phantom, Trust Wallet).",
                "NEVER type your 12-word seed recovery phrase anywhere."
            ]
        },
        {
            "scan_type": "file",
            "input_preview": "urgent_bank_statement_oct2026.pdf.exe",
            "risk_score": 96.0,
            "risk_level": "CRITICAL",
            "threat_category": "Malicious Executable / Double Extension Trojan",
            "is_malicious": True,
            "indicators": [
                "Deceptive double extension spoofing PDF: '.pdf.exe'",
                "Dangerous executable binary (.exe)",
                "Social engineering filename lure"
            ],
            "explanation": "File is a Windows executable disguised as an Adobe PDF document. Running it executes malicious payloads in the background.",
            "actions": [
                "DO NOT double-click or run this file.",
                "Permanently delete the file from your computer.",
                "Run a complete endpoint anti-malware scan."
            ]
        },
        {
            "scan_type": "url",
            "input_preview": "https://github.com/explore",
            "risk_score": 8.0,
            "risk_level": "SAFE",
            "threat_category": "Standard Safe Web Destination",
            "is_malicious": False,
            "indicators": ["Valid HTTPS encryption", "Established legitimate domain"],
            "explanation": "Legitimate, verified web destination with valid certificate and clean reputation history.",
            "actions": ["Safe to browse."]
        }
    ]

    for item in scans_data:
        scan = models.SecurityScan(
            user_id=demo_user.id,
            scan_type=item["scan_type"],
            input_preview=item["input_preview"],
            input_data=item["input_preview"],
            risk_score=item["risk_score"],
            risk_level=item["risk_level"],
            threat_category=item["threat_category"],
            is_malicious=item["is_malicious"],
            created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=2)
        )
        db.add(scan)
        db.commit()
        db.refresh(scan)

        threat = models.ThreatResult(
            scan_id=scan.id,
            threat_type=item["threat_category"],
            indicators_json=json.dumps(item["indicators"]),
            evidence_json=json.dumps({"input": item["input_preview"]}),
            score_breakdown_json=json.dumps({
                "url_reputation": item["risk_score"] * 0.9,
                "message_indicators": item["risk_score"] * 0.8,
                "domain_analysis": item["risk_score"] * 0.7,
                "financial_indicators": item["risk_score"] if item["scan_type"] == "financial" else 20.0,
                "user_context": 15.0,
                "threat_intelligence": 90.0 if item["is_malicious"] else 0.0
            }),
            explanation=item["explanation"],
            attack_chain_json=json.dumps([
                {
                    "step": 1,
                    "stage": "Initial Lure",
                    "title": "Unsolicited Stimulus",
                    "description": "Victim receives deceptive lure via SMS or web link.",
                    "indicators": ["Urgency", "Impersonation"],
                    "prevention_action": "Do not click unverified links."
                },
                {
                    "step": 2,
                    "stage": "Payload / Credential Theft",
                    "title": "Data Harvesting",
                    "description": "Attacker solicits PIN, password, or executes malicious script.",
                    "indicators": ["Deceptive form", "Unverified endpoint"],
                    "prevention_action": "Never disclose confidential credentials."
                }
            ]),
            preventive_actions_json=json.dumps(item["actions"]),
            incident_response_json=json.dumps([
                "Preserve screenshot and message headers",
                "Contact bank fraud helpline immediately if interacted"
            ]),
            security_awareness_json=json.dumps([
                "Legitimate institutions never ask for passwords or PINs."
            ]),
            ai_copilot_insights=f"CyberShield Forensic Copilot verified this as {item['threat_category']}. High defensive vigilance required."
        )
        db.add(threat)

    # 4. Initial Incident
    inc = models.Incident(
        user_id=demo_user.id,
        title="Received Suspicious Bank KYC Message",
        incident_type="clicked_link",
        severity="MEDIUM",
        status="CONTAINED",
        description="Clicked link in SMS claiming SBI account was blocked, but immediately closed browser before entering credentials.",
        affected_asset="Net-Banking Account",
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=1)
    )
    db.add(inc)
    db.commit()
    db.refresh(inc)

    act1 = models.IncidentAction(
        incident_id=inc.id,
        step_order=1,
        action_text="Browser window terminated before entering any password or PIN",
        action_priority="IMMEDIATE",
        is_completed=True,
        completed_at=datetime.datetime.utcnow()
    )
    act2 = models.IncidentAction(
        incident_id=inc.id,
        step_order=2,
        action_text="Cleared browser cache and active session cookies",
        action_priority="HIGH",
        is_completed=True,
        completed_at=datetime.datetime.utcnow()
    )
    act3 = models.IncidentAction(
        incident_id=inc.id,
        step_order=3,
        action_text="Monitored official SBI YONO app to verify account status is normal",
        action_priority="RECOMMENDED",
        is_completed=True,
        completed_at=datetime.datetime.utcnow()
    )
    db.add_all([act1, act2, act3])

    # 5. Seed Audit Logs
    db.add(models.AuditLog(
        user_id=admin.id,
        action="SYSTEM_INIT",
        resource="system",
        status="SUCCESS",
        details_json=json.dumps({"message": "CyberShield security engine booted"})
    ))

    db.commit()
    print("Database seeding completed successfully.")
