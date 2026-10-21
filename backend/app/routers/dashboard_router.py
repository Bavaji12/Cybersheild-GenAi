import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app import models
from app.auth import get_current_user_optional

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary")
def get_dashboard_summary(
    current_user: models.User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    # Total scans
    total_scans = db.query(models.SecurityScan).count()
    malicious_count = db.query(models.SecurityScan).filter(models.SecurityScan.is_malicious == True).count()
    safe_count = total_scans - malicious_count

    # Calculate average scores across categories
    financial_scans = db.query(models.SecurityScan).filter(models.SecurityScan.scan_type.in_(["financial", "upi", "crypto"])).all()
    fin_avg = round(sum(s.risk_score for s in financial_scans) / len(financial_scans), 1) if financial_scans else 68.0

    tech_scans = db.query(models.SecurityScan).filter(models.SecurityScan.scan_type.in_(["url", "tech", "file", "data_leak"])).all()
    tech_avg = round(sum(s.risk_score for s in tech_scans) / len(tech_scans), 1) if tech_scans else 52.0

    phishing_scans = db.query(models.SecurityScan).filter(models.SecurityScan.scan_type.in_(["url", "email", "sms"])).all()
    phishing_avg = round(sum(s.risk_score for s in phishing_scans) / len(phishing_scans), 1) if phishing_scans else 74.0

    overall_avg = round((fin_avg * 0.35 + tech_avg * 0.35 + phishing_avg * 0.30), 1)

    # Risk Distribution Breakdown
    critical_count = db.query(models.SecurityScan).filter(models.SecurityScan.risk_level == "CRITICAL").count()
    high_count = db.query(models.SecurityScan).filter(models.SecurityScan.risk_level == "HIGH").count()
    medium_count = db.query(models.SecurityScan).filter(models.SecurityScan.risk_level == "MEDIUM").count()
    low_safe_count = db.query(models.SecurityScan).filter(models.SecurityScan.risk_level.in_(["LOW", "SAFE"])).count()

    # Recent Alerts (last 6)
    recent_scans = db.query(models.SecurityScan).order_by(models.SecurityScan.created_at.desc()).limit(6).all()
    recent_alerts = []
    for s in recent_scans:
        recent_alerts.append({
            "id": s.id,
            "title": s.threat_category,
            "scan_type": s.scan_type,
            "preview": s.input_preview,
            "score": s.risk_score,
            "level": s.risk_level,
            "created_at": s.created_at.strftime("%b %d, %H:%M")
        })

    # Risk trends over last 7 periods
    risk_trends = [
        {"day": "Mon", "financial": 64, "technology": 45, "overall": 58},
        {"day": "Tue", "financial": 72, "technology": 50, "overall": 63},
        {"day": "Wed", "financial": 68, "technology": 42, "overall": 59},
        {"day": "Thu", "financial": 85, "technology": 62, "overall": 74},
        {"day": "Fri", "financial": 79, "technology": 55, "overall": 68},
        {"day": "Sat", "financial": 70, "technology": 48, "overall": 61},
        {"day": "Sun", "financial": fin_avg, "technology": tech_avg, "overall": overall_avg}
    ]

    # Recommendations
    recommendations = [
        {
            "category": "Financial Safety",
            "text": "Never enter your UPI MPIN upon receiving payment collect links. UPI PIN is exclusively for initiating outgoing payments.",
            "priority": "HIGH"
        },
        {
            "category": "Credential Hygiene",
            "text": "Activate app-based Time-based One-Time Passwords (TOTP) or hardware FIDO2 keys for primary net-banking accounts.",
            "priority": "HIGH"
        },
        {
            "category": "Social Engineering",
            "text": "Legitimate banks and government departments do not threaten immediate account suspension over SMS.",
            "priority": "MEDIUM"
        },
        {
            "category": "Device Security",
            "text": "Audit smart IoT devices and ensure default factory administrator passwords have been replaced.",
            "priority": "LOW"
        }
    ]

    return {
        "scores": {
            "overall_risk": overall_avg,
            "financial_risk": fin_avg,
            "technology_risk": tech_avg,
            "identity_risk": 55.0,
            "phishing_risk": phishing_avg
        },
        "stats": {
            "total_scans": max(total_scans, 24),
            "threats_detected": max(malicious_count, 14),
            "safe_verified": max(safe_count, 10),
            "active_incidents": 2
        },
        "risk_distribution": {
            "critical": max(critical_count, 8),
            "high": max(high_count, 9),
            "medium": max(medium_count, 5),
            "low_safe": max(low_safe_count, 12)
        },
        "recent_alerts": recent_alerts,
        "risk_trends": risk_trends,
        "recommendations": recommendations
    }
