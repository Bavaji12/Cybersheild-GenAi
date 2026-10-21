import datetime
import json
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(150), default="")
    role = Column(String(50), default="user")  # 'user', 'analyst', 'admin'
    is_active = Column(Boolean, default=True)
    mfa_enabled = Column(Boolean, default=False)
    mfa_secret = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    last_login = Column(DateTime, nullable=True)

    profile = relationship("UserSecurityProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    scans = relationship("SecurityScan", back_populates="user", cascade="all, delete-orphan")
    incidents = relationship("Incident", back_populates="user", cascade="all, delete-orphan")
    quiz_results = relationship("AwarenessQuizResult", back_populates="user", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user", cascade="all, delete-orphan")


class UserSecurityProfile(Base):
    __tablename__ = "user_security_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
    overall_score = Column(Float, default=78.0)
    financial_security = Column(Float, default=75.0)
    account_security = Column(Float, default=80.0)
    phishing_protection = Column(Float, default=70.0)
    device_security = Column(Float, default=85.0)
    privacy_protection = Column(Float, default=75.0)
    
    total_scans_performed = Column(Integer, default=0)
    threats_prevented = Column(Integer, default=0)
    high_risk_interactions = Column(Integer, default=0)
    recommendations_json = Column(Text, default="[]")
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="profile")


class SecurityScan(Base):
    __tablename__ = "security_scans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    
    scan_type = Column(String(50), index=True, nullable=False)  # 'url', 'email', 'sms', 'financial', 'qr', 'screenshot', 'file', 'data_leak'
    input_preview = Column(String(500), nullable=False)
    input_data = Column(Text, nullable=False)
    
    risk_score = Column(Float, nullable=False)  # 0 to 100
    risk_level = Column(String(50), nullable=False)  # 'SAFE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    threat_category = Column(String(100), nullable=False)  # e.g., 'Banking Fraud', 'Credential Phishing', 'Crypto Drainer'
    is_malicious = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)

    user = relationship("User", back_populates="scans")
    threat_result = relationship("ThreatResult", back_populates="scan", uselist=False, cascade="all, delete-orphan")
    report = relationship("SecurityReport", back_populates="scan", uselist=False, cascade="all, delete-orphan")


class ThreatResult(Base):
    __tablename__ = "threat_results"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("security_scans.id"), unique=True, nullable=False)
    
    threat_type = Column(String(100), nullable=False)
    indicators_json = Column(Text, default="[]")  # list of detected strings/rules
    evidence_json = Column(Text, default="{}")    # detailed evidence dictionary
    score_breakdown_json = Column(Text, default="{}")  # breakdown of factors
    explanation = Column(Text, nullable=False)
    attack_chain_json = Column(Text, default="[]") # chain of steps
    preventive_actions_json = Column(Text, default="[]")
    incident_response_json = Column(Text, default="[]")
    security_awareness_json = Column(Text, default="[]")
    
    ai_copilot_insights = Column(Text, nullable=True)

    scan = relationship("SecurityScan", back_populates="threat_result")


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    
    title = Column(String(200), nullable=False)
    incident_type = Column(String(100), nullable=False)  # 'clicked_link', 'shared_otp', 'entered_credentials', 'sent_funds', 'installed_app'
    severity = Column(String(50), default="MEDIUM")       # 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    status = Column(String(50), default="OPEN")           # 'OPEN', 'CONTAINED', 'RESOLVED'
    description = Column(Text, nullable=False)
    
    affected_asset = Column(String(200), default="Personal Account")
    user_responses_json = Column(Text, default="{}")  # questions answered
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="incidents")
    actions = relationship("IncidentAction", back_populates="incident", cascade="all, delete-orphan")


class IncidentAction(Base):
    __tablename__ = "incident_actions"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=False)
    
    step_order = Column(Integer, default=1)
    action_text = Column(Text, nullable=False)
    action_priority = Column(String(50), default="HIGH")  # 'IMMEDIATE', 'URGENT', 'RECOMMENDED'
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)

    incident = relationship("Incident", back_populates="actions")


class ThreatIntelligence(Base):
    __tablename__ = "threat_intelligence"

    id = Column(Integer, primary_key=True, index=True)
    indicator_type = Column(String(50), index=True)  # 'domain', 'url', 'ip', 'hash', 'phone', 'upi_vpa'
    indicator_value = Column(String(500), index=True, nullable=False)
    threat_label = Column(String(100), nullable=False)
    confidence = Column(Float, default=80.0)
    source = Column(String(100), default="CyberShield Threat Feed")
    details_json = Column(Text, default="{}")
    first_seen = Column(DateTime, default=datetime.datetime.utcnow)
    last_updated = Column(DateTime, default=datetime.datetime.utcnow)


class SecurityReport(Base):
    __tablename__ = "security_reports"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("security_scans.id"), nullable=True)
    report_reference = Column(String(64), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    summary = Column(Text, nullable=False)
    content_json = Column(Text, default="{}")
    format_type = Column(String(20), default="JSON")  # 'JSON', 'PDF'
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    scan = relationship("SecurityScan", back_populates="report")


class AwarenessQuizResult(Base):
    __tablename__ = "awareness_quiz_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category = Column(String(100), nullable=False)  # 'Phishing', 'UPI Scam', 'Crypto', 'Deepfakes'
    score = Column(Float, nullable=False)
    total_questions = Column(Integer, default=5)
    passed = Column(Boolean, default=True)
    answers_json = Column(Text, default="[]")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="quiz_results")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)
    resource = Column(String(100), nullable=False)
    status = Column(String(50), default="SUCCESS")
    ip_address = Column(String(50), default="127.0.0.1")
    user_agent = Column(String(255), default="CyberShield Web Client")
    details_json = Column(Text, default="{}")
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)

    user = relationship("User", back_populates="audit_logs")
