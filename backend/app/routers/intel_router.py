from fastapi import APIRouter
from pydantic import BaseModel
from app import schemas
from app.services.threat_intel import query_threat_intelligence, get_threat_feed_list, add_cyber_record

router = APIRouter(prefix="/threat-intel", tags=["Threat Intelligence"])

class AddCyberRecordRequest(BaseModel):
    indicator: str
    indicator_type: str  # 'phone', 'upi_vpa', 'domain'
    threat_description: str = "Financial Cybercrime / Fraud"
    source: str = "National Cyber Crime Record"

@router.post("/lookup", response_model=schemas.ThreatIntelLookupResponse)
def lookup_indicator(req: schemas.ThreatIntelLookupRequest):
    res = query_threat_intelligence(req.indicator, req.indicator_type or "domain")
    return schemas.ThreatIntelLookupResponse(
        indicator=res["indicator"],
        indicator_type=res["indicator_type"],
        is_flagged=res["is_flagged"],
        confidence=res["confidence"],
        threat_label=res["threat_label"],
        source=res["source"],
        details=res.get("details", {}),
        last_updated=res["last_updated"]
    )

@router.post("/add-cyber-record")
def register_cyber_record(req: AddCyberRecordRequest):
    add_cyber_record(
        indicator=req.indicator,
        indicator_type=req.indicator_type,
        threat=req.threat_description,
        source=req.source
    )
    return {
        "status": "SUCCESS",
        "message": f"Successfully registered '{req.indicator}' as Identified in cyber record ({req.threat_description})",
        "indicator": req.indicator,
        "indicator_type": req.indicator_type
    }

@router.get("/feed")
def get_threat_feed():
    feed = get_threat_feed_list(limit=35)
    return {
        "status": "ONLINE",
        "feed_provider": "CyberShield Threat Intelligence Exchange",
        "total_active_indicators": len(feed),
        "indicators": feed
    }
