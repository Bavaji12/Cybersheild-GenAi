import datetime
from typing import Optional, Any
from pydantic import BaseModel, EmailStr, Field

# Authentication
class UserRegisterRequest(BaseModel):
    email: EmailStr
    username: str
    password: str
    full_name: Optional[str] = ""

class UserLoginRequest(BaseModel):
    username_or_email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    full_name: Optional[str] = ""
    role: str
    is_active: bool
    mfa_enabled: bool
    created_at: datetime.datetime
    last_login: Optional[datetime.datetime] = None

class ProfileResponse(BaseModel):
    overall_score: float
    financial_security: float
    account_security: float
    phishing_protection: float
    device_security: float
    privacy_protection: float
    total_scans_performed: int
    threats_prevented: int
    high_risk_interactions: int
    recommendations: list[str]

# Security Scans
class ScanRequest(BaseModel):
    scan_type: str  # 'url', 'message', 'financial', 'qr', 'screenshot', 'tech', 'data_leak'
    content: str
    metadata: Optional[dict[str, Any]] = None

class AttackChainStep(BaseModel):
    step: int
    stage: str
    description: str
    indicators: list[str] = []
    prevention_action: str

class ScoreBreakdown(BaseModel):
    url_reputation: float = 0.0
    message_indicators: float = 0.0
    domain_analysis: float = 0.0
    financial_indicators: float = 0.0
    user_context: float = 0.0
    threat_intelligence: float = 0.0

class ScanResultResponse(BaseModel):
    scan_id: Optional[int] = None
    scan_type: str
    input_preview: str
    risk_score: float
    risk_level: str  # SAFE, LOW, MEDIUM, HIGH, CRITICAL
    threat_category: str
    is_malicious: bool
    indicators: list[str]
    evidence: dict[str, Any]
    score_breakdown: ScoreBreakdown
    explanation: str
    attack_chain: list[dict[str, Any]]
    preventive_actions: list[str]
    incident_response_steps: list[str]
    security_awareness_tips: list[str]
    copilot_explanation: Optional[str] = None
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

# Copilot
class CopilotChatRequest(BaseModel):
    message: str
    scan_context: Optional[dict[str, Any]] = None
    history: Optional[list[dict[str, str]]] = None

class CopilotChatResponse(BaseModel):
    reply: str
    suggested_actions: list[str] = []
    educational_takeaway: Optional[str] = None
    source: str = "CyberShield Security Copilot"

# Incident Reporting
class IncidentCreateRequest(BaseModel):
    title: str
    incident_type: str
    description: str
    affected_asset: Optional[str] = "Personal Account"
    clicked_link: bool = False
    entered_credentials: bool = False
    shared_otp: bool = False
    sent_payment: bool = False
    installed_app: bool = False
    connected_wallet: bool = False

class IncidentActionItem(BaseModel):
    id: Optional[int] = None
    step_order: int
    action_text: str
    action_priority: str
    is_completed: bool = False

class IncidentResponse(BaseModel):
    id: int
    title: str
    incident_type: str
    severity: str
    status: str
    description: str
    affected_asset: str
    created_at: datetime.datetime
    actions: list[IncidentActionItem] = []

# Threat Intelligence
class ThreatIntelLookupRequest(BaseModel):
    indicator: str
    indicator_type: Optional[str] = None  # auto-detected if None

class ThreatIntelLookupResponse(BaseModel):
    indicator: str
    indicator_type: str
    is_flagged: bool
    confidence: float
    threat_label: str
    source: str
    details: dict[str, Any]
    last_updated: datetime.datetime

# Quiz
class QuizSubmitRequest(BaseModel):
    category: str
    answers: dict[str, str]

class QuizSubmitResponse(BaseModel):
    score: float
    total: int
    correct: int
    passed: bool
    explanations: dict[str, str]
