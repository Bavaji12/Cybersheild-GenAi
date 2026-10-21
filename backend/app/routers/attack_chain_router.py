from fastapi import APIRouter
from pydantic import BaseModel
from app.services.attack_chain import generate_attack_chain

router = APIRouter(prefix="/attack-chain", tags=["Attack Chain Analyzer"])

class AttackChainRequest(BaseModel):
    threat_category: str
    indicators: list[str] = []
    risk_level: str = "HIGH"

@router.post("/generate")
def create_attack_chain(req: AttackChainRequest):
    chain = generate_attack_chain(req.threat_category, req.indicators, req.risk_level)
    return {
        "threat_category": req.threat_category,
        "risk_level": req.risk_level,
        "total_stages": len(chain),
        "chain": chain
    }
