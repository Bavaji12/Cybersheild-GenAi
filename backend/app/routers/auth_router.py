import datetime
import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import get_password_hash, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=schemas.TokenResponse)
def register(req: schemas.UserRegisterRequest, db: Session = Depends(get_db)):
    # Check if user already exists
    existing = db.query(models.User).filter(
        (models.User.email == req.email.lower()) | (models.User.username == req.username.lower())
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username or email already registered")

    user = models.User(
        email=req.email.lower(),
        username=req.username.lower(),
        hashed_password=get_password_hash(req.password),
        full_name=req.full_name or req.username,
        role="user",
        created_at=datetime.datetime.utcnow(),
        last_login=datetime.datetime.utcnow()
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Initialize User Security Profile
    profile = models.UserSecurityProfile(
        user_id=user.id,
        overall_score=75.0,
        financial_security=70.0,
        account_security=80.0,
        phishing_protection=65.0,
        device_security=85.0,
        privacy_protection=75.0,
        recommendations_json=json.dumps([
            "Enable Multi-Factor Authentication (MFA) in settings",
            "Perform a baseline URL and message scam analysis",
            "Complete the Phishing & UPI Fraud awareness quizzes"
        ])
    )
    db.add(profile)
    
    # Audit log
    audit = models.AuditLog(
        user_id=user.id,
        action="USER_REGISTER",
        resource="auth",
        status="SUCCESS"
    )
    db.add(audit)
    db.commit()

    token = create_access_token({"sub": str(user.id), "username": user.username, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "full_name": user.full_name,
            "role": user.role,
            "mfa_enabled": user.mfa_enabled
        }
    }

@router.post("/login", response_model=schemas.TokenResponse)
def login(req: schemas.UserLoginRequest, db: Session = Depends(get_db)):
    identity = req.username_or_email.lower().strip()
    user = db.query(models.User).filter(
        (models.User.email == identity) | (models.User.username == identity)
    ).first()

    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )

    user.last_login = datetime.datetime.utcnow()
    
    audit = models.AuditLog(
        user_id=user.id,
        action="USER_LOGIN",
        resource="auth",
        status="SUCCESS"
    )
    db.add(audit)
    db.commit()

    token = create_access_token({"sub": str(user.id), "username": user.username, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "full_name": user.full_name,
            "role": user.role,
            "mfa_enabled": user.mfa_enabled
        }
    }

@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@router.get("/profile", response_model=schemas.ProfileResponse)
def get_profile(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(models.UserSecurityProfile).filter(models.UserSecurityProfile.user_id == current_user.id).first()
    if not profile:
        profile = models.UserSecurityProfile(
            user_id=current_user.id,
            overall_score=75.0,
            financial_security=70.0,
            account_security=80.0,
            phishing_protection=65.0,
            device_security=85.0,
            privacy_protection=75.0
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

    recs = json.loads(profile.recommendations_json or "[]")
    return {
        "overall_score": profile.overall_score,
        "financial_security": profile.financial_security,
        "account_security": profile.account_security,
        "phishing_protection": profile.phishing_protection,
        "device_security": profile.device_security,
        "privacy_protection": profile.privacy_protection,
        "total_scans_performed": profile.total_scans_performed,
        "threats_prevented": profile.threats_prevented,
        "high_risk_interactions": profile.high_risk_interactions,
        "recommendations": recs
    }

@router.post("/toggle-mfa")
def toggle_mfa(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    current_user.mfa_enabled = not current_user.mfa_enabled
    # Recalculate account security score in profile
    profile = db.query(models.UserSecurityProfile).filter(models.UserSecurityProfile.user_id == current_user.id).first()
    if profile:
        if current_user.mfa_enabled:
            profile.account_security = min(100.0, profile.account_security + 15.0)
        else:
            profile.account_security = max(40.0, profile.account_security - 15.0)
        profile.overall_score = round((profile.financial_security + profile.account_security + profile.phishing_protection + profile.device_security + profile.privacy_protection) / 5.0, 1)
    
    db.commit()
    return {"mfa_enabled": current_user.mfa_enabled, "message": f"MFA has been {'enabled' if current_user.mfa_enabled else 'disabled'} successfully"}
