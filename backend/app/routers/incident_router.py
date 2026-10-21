import datetime
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user_optional
from app.services.incident_service import generate_incident_response_plan

router = APIRouter(prefix="/incidents", tags=["Incident Response"])

@router.post("/report", response_model=schemas.IncidentResponse)
def report_incident(
    req: schemas.IncidentCreateRequest,
    current_user: models.User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    severity, actions_data = generate_incident_response_plan(
        incident_type=req.incident_type,
        clicked_link=req.clicked_link,
        entered_credentials=req.entered_credentials,
        shared_otp=req.shared_otp,
        sent_payment=req.sent_payment,
        installed_app=req.installed_app,
        connected_wallet=req.connected_wallet
    )

    incident = models.Incident(
        user_id=current_user.id if current_user else None,
        title=req.title,
        incident_type=req.incident_type,
        severity=severity,
        status="OPEN",
        description=req.description,
        affected_asset=req.affected_asset or "Personal Account",
        user_responses_json=json.dumps({
            "clicked_link": req.clicked_link,
            "entered_credentials": req.entered_credentials,
            "shared_otp": req.shared_otp,
            "sent_payment": req.sent_payment,
            "installed_app": req.installed_app,
            "connected_wallet": req.connected_wallet
        }),
        created_at=datetime.datetime.utcnow()
    )
    db.add(incident)
    db.commit()
    db.refresh(incident)

    # Add actions
    action_items = []
    for a in actions_data:
        db_action = models.IncidentAction(
            incident_id=incident.id,
            step_order=a["step_order"],
            action_text=a["action_text"],
            action_priority=a["action_priority"],
            is_completed=False
        )
        db.add(db_action)
        db.commit()
        db.refresh(db_action)
        action_items.append(schemas.IncidentActionItem(
            id=db_action.id,
            step_order=db_action.step_order,
            action_text=db_action.action_text,
            action_priority=db_action.action_priority,
            is_completed=db_action.is_completed
        ))

    # Audit log
    audit = models.AuditLog(
        user_id=current_user.id if current_user else None,
        action="INCIDENT_REPORTED",
        resource=f"incident:{incident.id}",
        details_json=json.dumps({"severity": severity, "type": req.incident_type})
    )
    db.add(audit)
    db.commit()

    return schemas.IncidentResponse(
        id=incident.id,
        title=incident.title,
        incident_type=incident.incident_type,
        severity=incident.severity,
        status=incident.status,
        description=incident.description,
        affected_asset=incident.affected_asset,
        created_at=incident.created_at,
        actions=action_items
    )

@router.get("", response_model=list[schemas.IncidentResponse])
def get_incidents(
    current_user: models.User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    query = db.query(models.Incident)
    if current_user:
        query = query.filter((models.Incident.user_id == current_user.id) | (models.Incident.user_id.is_(None)))
    incidents = query.order_by(models.Incident.created_at.desc()).all()

    results = []
    for inc in incidents:
        actions = []
        for a in inc.actions:
            actions.append(schemas.IncidentActionItem(
                id=a.id,
                step_order=a.step_order,
                action_text=a.action_text,
                action_priority=a.action_priority,
                is_completed=a.is_completed
            ))
        results.append(schemas.IncidentResponse(
            id=inc.id,
            title=inc.title,
            incident_type=inc.incident_type,
            severity=inc.severity,
            status=inc.status,
            description=inc.description,
            affected_asset=inc.affected_asset,
            created_at=inc.created_at,
            actions=actions
        ))
    return results

@router.patch("/action/{action_id}/toggle")
def toggle_action(action_id: int, db: Session = Depends(get_db)):
    action = db.query(models.IncidentAction).filter(models.IncidentAction.id == action_id).first()
    if not action:
        raise HTTPException(status_code=404, detail="Incident action not found")
    
    action.is_completed = not action.is_completed
    action.completed_at = datetime.datetime.utcnow() if action.is_completed else None
    
    # Check if all actions in the incident are done
    incident = action.incident
    all_done = all(a.is_completed for a in incident.actions)
    if all_done:
        incident.status = "RESOLVED"
        incident.resolved_at = datetime.datetime.utcnow()
    else:
        incident.status = "IN_PROGRESS"
    
    db.commit()
    return {
        "id": action.id,
        "is_completed": action.is_completed,
        "incident_status": incident.status
    }
