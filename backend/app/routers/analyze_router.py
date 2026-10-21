import json
import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user_optional

from app.analyzers.url_analyzer import analyze_url
from app.analyzers.message_analyzer import analyze_message
from app.analyzers.financial_analyzer import analyze_financial_threat
from app.analyzers.tech_analyzer import analyze_data_leak, analyze_file_metadata, analyze_iot_security
from app.analyzers.qr_analyzer import analyze_qr_payload
from app.analyzers.screenshot_analyzer import analyze_screenshot_text

from app.services.risk_engine import compute_unified_risk_score
from app.services.threat_intel import query_threat_intelligence, check_cyber_record
from app.services.attack_chain import generate_attack_chain
from app.services.copilot_service import ask_copilot

router = APIRouter(prefix="/analyze", tags=["Security Analyzers"])

@router.post("/scan", response_model=schemas.ScanResultResponse)
def execute_scan(
    req: schemas.ScanRequest,
    current_user: Optional[models.User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    scan_type = req.scan_type.lower().strip()
    content = req.content.strip()
    metadata = req.metadata or {}

    # Initialize analysis components
    url_score = 0.0
    msg_score = 0.0
    domain_score = 0.0
    fin_score = 0.0
    user_ctx_score = 0.0
    threat_intel_score = 0.0

    indicators = []
    evidence = {}
    explanation = ""
    threat_category = "General Threat"
    alert_msg = ""
    preventive_actions = []
    incident_response_steps = []
    security_awareness_tips = []

    # 0. UNIVERSAL CYBER CELL RECORD CHECK (Phone, UPI, Identifiers)
    is_cyber, matched_ind, cyber_details = check_cyber_record(content)
    if not is_cyber and metadata.get("sender"):
        is_cyber, matched_ind, cyber_details = check_cyber_record(str(metadata.get("sender")))

    if is_cyber:
        alert_msg = cyber_details.get("alert") or "UNSAFE – Identified in cyber record alert."
        threat_category = alert_msg
        explanation = alert_msg
        indicators.append(alert_msg)
        evidence["cyber_record_match"] = {
            "matched_indicator": matched_ind,
            "threat": cyber_details.get("threat"),
            "source": cyber_details.get("source"),
            "status": "Identified in cyber record",
            "alert": alert_msg
        }
        fin_score = 100.0
        threat_intel_score = 100.0

    # 1. Dispatch to appropriate specialized analyzer
    if scan_type in ["url", "website"]:
        res = analyze_url(content)
        url_score = res["risk_score"]
        domain_score = res["risk_score"] * 0.9
        indicators.extend(res["indicators"])
        evidence = res["evidence"]
        explanation = res["explanation"]
        threat_category = res["threat_category"]
        preventive_actions.append(res["recommendation"])

        # Threat Intel Query
        intel = query_threat_intelligence(res["domain"], "domain")
        evidence["threat_intel"] = intel
        if intel["is_flagged"]:
            threat_intel_score = intel["confidence"]
            indicators.append(f"Threat Intelligence Feed Flagged: {intel['threat_label']} ({intel['source']})")

    elif scan_type in ["email", "sms", "message", "social"]:
        sender = metadata.get("sender", "")
        res = analyze_message(content, sender=sender)
        msg_score = res["risk_score"]
        indicators.extend(res["indicators"])
        evidence = res["evidence"]
        explanation = res["explanation"]
        threat_category = res["threat_category"]
        preventive_actions.extend(res.get("preventive_actions", []))

        # Check extracted URLs with Threat Intel
        for u in evidence.get("extracted_urls", []):
            intel = query_threat_intelligence(u, "url")
            if intel["is_flagged"]:
                threat_intel_score = max(threat_intel_score, intel["confidence"])
                indicators.append(f"Embedded URL flagged in threat intelligence feed: {intel['threat_label']}")

    elif scan_type in ["financial", "upi", "banking", "crypto"]:
        res = analyze_financial_threat(content)
        fin_score = res["risk_score"]
        msg_score = res["risk_score"] * 0.5
        indicators.extend(res["indicators"])
        evidence = res["evidence"]
        explanation = res["explanation"]
        threat_category = res["threat_category"]
        preventive_actions.extend(res.get("preventive_actions", []))

        # Check detected VPAs with Threat Intel
        for vpa in evidence.get("detected_vpas", []):
            intel = query_threat_intelligence(vpa, "upi_vpa")
            if intel["is_flagged"]:
                threat_intel_score = max(threat_intel_score, intel["confidence"])
                indicators.append(f"UPI VPA flagged in fraud blacklist: {intel['threat_label']}")

    elif scan_type in ["qr", "qrcode"]:
        res = analyze_qr_payload(content)
        fin_score = res["risk_score"] * 0.8
        url_score = res["risk_score"] * 0.8
        indicators.extend(res["indicators"])
        evidence = res["evidence"]
        explanation = res["explanation"]
        threat_category = res["threat_category"]
        preventive_actions.extend(res.get("preventive_actions", []))

    elif scan_type in ["screenshot", "ocr"]:
        res = analyze_screenshot_text(content)
        msg_score = res["risk_score"]
        fin_score = res["risk_score"] * 0.9
        indicators.extend(res["indicators"])
        evidence = res["evidence"]
        explanation = res["explanation"]
        threat_category = res["threat_category"]
        preventive_actions.extend(res.get("preventive_actions", []))

    elif scan_type in ["data_leak", "secret"]:
        res = analyze_data_leak(content)
        msg_score = res["risk_score"]
        indicators.extend([f"Exposed {f['type']} (Count: {f['count']})" for f in res["findings"]])
        evidence = {"findings": res["findings"], "redacted_preview": res["redacted_preview"]}
        explanation = res["explanation"]
        threat_category = res["threat_category"]
        preventive_actions.extend(res.get("preventive_actions", []))

    elif scan_type in ["file", "malware"]:
        filename = metadata.get("filename", content)
        file_hash = metadata.get("hash", "")
        res = analyze_file_metadata(filename=filename, file_hash=file_hash)
        url_score = res["risk_score"]
        indicators.extend(res["indicators"])
        evidence = {"filename": res["filename"], "sha256": res["sha256"]}
        explanation = res["explanation"]
        threat_category = res["threat_category"]
        preventive_actions.extend(res.get("preventive_actions", []))
        if res.get("threat_feed_match"):
            threat_intel_score = 100.0

    elif scan_type in ["iot"]:
        device_type = metadata.get("device_type", "Smart Camera / Router")
        res = analyze_iot_security(device_type, metadata)
        msg_score = res["risk_score"]
        indicators.extend(res["indicators"])
        explanation = "IoT device security assessment completed based on configuration parameters."
        threat_category = res["threat_category"]
        preventive_actions.extend(res.get("preventive_actions", []))

    else:
        # Default fallback to message analyzer
        res = analyze_message(content)
        msg_score = res["risk_score"]
        indicators.extend(res["indicators"])
        evidence = res["evidence"]
        explanation = res["explanation"]
        threat_category = res["threat_category"]
        preventive_actions.extend(res.get("preventive_actions", []))

    # 2. Compute Unified Risk Score
    final_score, risk_level, breakdown = compute_unified_risk_score(
        url_reputation_score=url_score,
        message_indicators_score=msg_score,
        domain_analysis_score=domain_score,
        financial_indicators_score=fin_score,
        user_context_score=user_ctx_score,
        threat_intel_score=threat_intel_score
    )

    # Force UNSAFE / CRITICAL if entity is Identified in cyber record
    if is_cyber or evidence.get("cyber_record_match") or any("cyber record" in ind.lower() or "alert" in ind.lower() for ind in indicators):
        final_score = 98.0
        risk_level = "CRITICAL"
        if is_cyber and cyber_details.get("alert"):
            threat_category = cyber_details["alert"]
            explanation = cyber_details["alert"]
        elif evidence.get("cyber_record_match", {}).get("alert"):
            threat_category = evidence["cyber_record_match"]["alert"]
            explanation = evidence["cyber_record_match"]["alert"]
        else:
            threat_category = "Identified in cyber record alert."
            explanation = "Identified in cyber record alert."

        if not any(alert_msg in ind for ind in indicators):
            indicators.insert(0, threat_category)


    # 3. Generate Attack Chain
    attack_chain = generate_attack_chain(threat_category, indicators, risk_level)

    # 4. Standardize response actions & tips
    if final_score >= 60:
        incident_response_steps = [
            "1. Disconnect and do not click links or authorize transactions.",
            "2. Preserve the message, URL, or screenshot as evidence.",
            "3. If credentials or OTP were entered, immediately change passwords and freeze bank/wallet access.",
            "4. File a formal complaint with the National Cyber Crime Reporting Portal (1930 / cybercrime.gov.in)."
        ]
    else:
        incident_response_steps = [
            "1. Maintain vigilance with unsolicited notifications.",
            "2. Ensure app-based MFA is enabled on all associated accounts."
        ]

    security_awareness_tips = [
        "Never enter your UPI MPIN or approve collect requests to receive money.",
        "Verify all financial or KYC notifications directly through the official bank app or phone line.",
        "Legitimate organizations will never demand immediate payment under threat of immediate arrest or power cutoff."
    ]

    # 5. Call CyberShield Security Copilot for reasoning
    scan_summary_dict = {
        "scan_type": scan_type,
        "threat_category": threat_category,
        "risk_score": final_score,
        "risk_level": risk_level,
        "indicators": indicators,
        "input_preview": content[:200],
        "evidence": evidence
    }
    copilot_res = ask_copilot("Explain this detected threat and provide prioritized defense steps.", scan_summary_dict)
    copilot_explanation = copilot_res.get("reply", "")

    # 6. Persist scan in database
    is_malicious = final_score >= 60.0
    db_scan = models.SecurityScan(
        user_id=current_user.id if current_user else None,
        scan_type=scan_type,
        input_preview=content[:250],
        input_data=content,
        risk_score=final_score,
        risk_level=risk_level,
        threat_category=threat_category,
        is_malicious=is_malicious,
        created_at=datetime.datetime.utcnow()
    )
    db.add(db_scan)
    db.commit()
    db.refresh(db_scan)

    db_threat = models.ThreatResult(
        scan_id=db_scan.id,
        threat_type=threat_category,
        indicators_json=json.dumps(indicators),
        evidence_json=json.dumps(evidence),
        score_breakdown_json=json.dumps(breakdown.model_dump()),
        explanation=explanation,
        attack_chain_json=json.dumps(attack_chain),
        preventive_actions_json=json.dumps(preventive_actions),
        incident_response_json=json.dumps(incident_response_steps),
        security_awareness_json=json.dumps(security_awareness_tips),
        ai_copilot_insights=copilot_explanation
    )
    db.add(db_threat)

    # 7. Update User Profile if user logged in
    if current_user:
        profile = db.query(models.UserSecurityProfile).filter(models.UserSecurityProfile.user_id == current_user.id).first()
        if profile:
            profile.total_scans_performed += 1
            if is_malicious:
                profile.threats_prevented += 1
                if scan_type in ["financial", "upi", "crypto"]:
                    profile.financial_security = max(20.0, profile.financial_security - 2.0)
                elif scan_type in ["url", "email", "sms"]:
                    profile.phishing_protection = max(20.0, profile.phishing_protection - 2.0)
            else:
                # Safe scans reward positive cyber hygiene
                profile.financial_security = min(98.0, profile.financial_security + 1.0)
                profile.phishing_protection = min(98.0, profile.phishing_protection + 1.0)
            
            profile.overall_score = round((profile.financial_security + profile.account_security + profile.phishing_protection + profile.device_security + profile.privacy_protection) / 5.0, 1)

    db.commit()

    return schemas.ScanResultResponse(
        scan_id=db_scan.id,
        scan_type=scan_type,
        input_preview=content[:250],
        risk_score=final_score,
        risk_level=risk_level,
        threat_category=threat_category,
        is_malicious=is_malicious,
        indicators=indicators,
        evidence=evidence,
        score_breakdown=breakdown,
        explanation=explanation,
        attack_chain=attack_chain,
        preventive_actions=preventive_actions,
        incident_response_steps=incident_response_steps,
        security_awareness_tips=security_awareness_tips,
        copilot_explanation=copilot_explanation,
        created_at=db_scan.created_at
    )

@router.get("/history", response_model=list[dict])
def get_scan_history(
    limit: int = Query(20, ge=1, le=100),
    current_user: Optional[models.User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    query = db.query(models.SecurityScan)
    if current_user:
        query = query.filter((models.SecurityScan.user_id == current_user.id) | (models.SecurityScan.user_id.is_(None)))
    scans = query.order_by(models.SecurityScan.created_at.desc()).limit(limit).all()

    results = []
    for s in scans:
        results.append({
            "id": s.id,
            "scan_type": s.scan_type,
            "input_preview": s.input_preview,
            "risk_score": s.risk_score,
            "risk_level": s.risk_level,
            "threat_category": s.threat_category,
            "is_malicious": s.is_malicious,
            "created_at": s.created_at.isoformat()
        })
    return results

@router.get("/{scan_id}", response_model=schemas.ScanResultResponse)
def get_scan_details(scan_id: int, db: Session = Depends(get_db)):
    scan = db.query(models.SecurityScan).filter(models.SecurityScan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    threat = scan.threat_result
    indicators = json.loads(threat.indicators_json or "[]") if threat else []
    evidence = json.loads(threat.evidence_json or "{}") if threat else {}
    breakdown_dict = json.loads(threat.score_breakdown_json or "{}") if threat else {}
    attack_chain = json.loads(threat.attack_chain_json or "[]") if threat else []
    prevention = json.loads(threat.preventive_actions_json or "[]") if threat else []
    ir_steps = json.loads(threat.incident_response_json or "[]") if threat else []
    awareness = json.loads(threat.security_awareness_json or "[]") if threat else []

    breakdown = schemas.ScoreBreakdown(**breakdown_dict) if breakdown_dict else schemas.ScoreBreakdown()

    return schemas.ScanResultResponse(
        scan_id=scan.id,
        scan_type=scan.scan_type,
        input_preview=scan.input_preview,
        risk_score=scan.risk_score,
        risk_level=scan.risk_level,
        threat_category=scan.threat_category,
        is_malicious=scan.is_malicious,
        indicators=indicators,
        evidence=evidence,
        score_breakdown=breakdown,
        explanation=threat.explanation if threat else "No explanation available",
        attack_chain=attack_chain,
        preventive_actions=prevention,
        incident_response_steps=ir_steps,
        security_awareness_tips=awareness,
        copilot_explanation=threat.ai_copilot_insights if threat else None,
        created_at=scan.created_at
    )
