import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.services.copilot_service import ask_copilot

router = APIRouter(prefix="/copilot", tags=["Security Copilot"])

@router.post("/chat", response_model=schemas.CopilotChatResponse)
def copilot_chat(req: schemas.CopilotChatRequest):
    res = ask_copilot(
        user_query=req.message,
        scan_context=req.scan_context,
        history=req.history
    )
    return schemas.CopilotChatResponse(
        reply=res["reply"],
        suggested_actions=res.get("suggested_actions", []),
        educational_takeaway=res.get("educational_takeaway", None),
        source=res.get("source", "CyberShield Security Copilot")
    )

@router.get("/explain/{scan_id}", response_model=schemas.CopilotChatResponse)
def explain_scan(scan_id: int, db: Session = Depends(get_db)):
    scan = db.query(models.SecurityScan).filter(models.SecurityScan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    threat = scan.threat_result
    indicators = json.loads(threat.indicators_json or "[]") if threat else []
    evidence = json.loads(threat.evidence_json or "{}") if threat else {}

    scan_ctx = {
        "scan_type": scan.scan_type,
        "threat_category": scan.threat_category,
        "risk_score": scan.risk_score,
        "risk_level": scan.risk_level,
        "indicators": indicators,
        "evidence": evidence,
        "input_preview": scan.input_preview
    }

    res = ask_copilot("Explain this detected threat, why it is dangerous, and what specific steps I must take right now.", scan_ctx)
    return schemas.CopilotChatResponse(
        reply=res["reply"],
        suggested_actions=res.get("suggested_actions", []),
        educational_takeaway=res.get("educational_takeaway", None),
        source=res.get("source", "CyberShield Security Copilot")
    )
