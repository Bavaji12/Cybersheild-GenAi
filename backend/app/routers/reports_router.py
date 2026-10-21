import json
from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from app.services.report_service import generate_pdf_report

router = APIRouter(prefix="/reports", tags=["Forensic Security Reports"])

@router.get("")
def list_reports(db: Session = Depends(get_db)):
    scans = db.query(models.SecurityScan).order_by(models.SecurityScan.created_at.desc()).limit(30).all()
    reports = []
    for s in scans:
        threat = s.threat_result
        reports.append({
            "report_id": f"CS-{s.id:04d}",
            "scan_id": s.id,
            "threat_type": s.threat_category,
            "scan_type": s.scan_type,
            "risk_score": s.risk_score,
            "risk_level": s.risk_level,
            "input_preview": s.input_preview,
            "created_at": s.created_at.isoformat()
        })
    return reports

@router.get("/{scan_id}/download-pdf")
def download_pdf_report(scan_id: int, db: Session = Depends(get_db)):
    scan = db.query(models.SecurityScan).filter(models.SecurityScan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan record not found")

    threat = scan.threat_result
    indicators = json.loads(threat.indicators_json or "[]") if threat else []
    preventive_actions = json.loads(threat.preventive_actions_json or "[]") if threat else []

    scan_data = {
        "scan_id": scan.id,
        "scan_type": scan.scan_type,
        "input_preview": scan.input_preview,
        "risk_score": scan.risk_score,
        "risk_level": scan.risk_level,
        "threat_category": scan.threat_category,
        "indicators": indicators,
        "explanation": threat.explanation if threat else "Forensic scan completed.",
        "preventive_actions": preventive_actions,
        "copilot_explanation": threat.ai_copilot_insights if threat else None,
        "created_at": str(scan.created_at)
    }

    pdf_bytes = generate_pdf_report(scan_data)
    filename = f"CyberShield_Forensic_Report_CS{scan.id:04d}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/{scan_id}/json")
def download_json_report(scan_id: int, db: Session = Depends(get_db)):
    scan = db.query(models.SecurityScan).filter(models.SecurityScan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan record not found")

    threat = scan.threat_result
    indicators = json.loads(threat.indicators_json or "[]") if threat else []
    evidence = json.loads(threat.evidence_json or "{}") if threat else {}
    breakdown = json.loads(threat.score_breakdown_json or "{}") if threat else {}
    attack_chain = json.loads(threat.attack_chain_json or "[]") if threat else []
    preventive_actions = json.loads(threat.preventive_actions_json or "[]") if threat else []
    ir_steps = json.loads(threat.incident_response_json or "[]") if threat else []

    report_payload = {
        "report_id": f"CS-{scan.id:04d}",
        "organization": "CyberShield – GenAI Forensic Security Platform",
        "generated_timestamp": str(scan.created_at),
        "target": {
            "type": scan.scan_type,
            "preview": scan.input_preview
        },
        "assessment": {
            "risk_score": scan.risk_score,
            "risk_level": scan.risk_level,
            "threat_category": scan.threat_category,
            "is_malicious": scan.is_malicious
        },
        "forensic_breakdown": breakdown,
        "evidence_extracted": evidence,
        "identified_indicators": indicators,
        "explanation": threat.explanation if threat else "",
        "attack_chain": attack_chain,
        "preventive_recommendations": preventive_actions,
        "incident_response_checklist": ir_steps,
        "copilot_analysis": threat.ai_copilot_insights if threat else None
    }

    return JSONResponse(
        content=report_payload,
        headers={"Content-Disposition": f"attachment; filename=CyberShield_Report_CS{scan.id:04d}.json"}
    )
