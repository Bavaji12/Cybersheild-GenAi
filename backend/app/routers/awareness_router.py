import json
import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user_optional

router = APIRouter(prefix="/awareness", tags=["Security Awareness & Quizzes"])

QUIZ_QUESTION_BANK = {
    "phishing": [
        {
            "id": "q1",
            "question": "You receive an SMS: 'Your bank account will be blocked today. Click here immediately to update KYC: http://sbi-kyc-verify.buzz'. What should you do?",
            "options": [
                {"key": "A", "text": "Click the link and quickly submit your PAN card number"},
                {"key": "B", "text": "Reply to the SMS asking for the customer care representative's name"},
                {"key": "C", "text": "Ignore the link and verify your account status directly via the official bank app or helpline"},
                {"key": "D", "text": "Forward the message to family members so they can test if it works"}
            ],
            "correct": "C",
            "explanation": "Legitimate banks never threaten immediate account suspension via SMS or use suspicious domain extensions like '.buzz'. Always verify directly through verified channels."
        },
        {
            "id": "q2",
            "question": "Which of the following is a classic indicator of a spear-phishing email?",
            "options": [
                {"key": "A", "text": "An email sent from an official @company.com address with no urgent attachments"},
                {"key": "B", "text": "An urgent request from a 'CEO' asking you to purchase gift cards or execute an emergency wire transfer"},
                {"key": "C", "text": "A standard automated calendar invitation from your direct manager"},
                {"key": "D", "text": "A password reset confirmation you requested 2 minutes ago"}
            ],
            "correct": "B",
            "explanation": "Executive impersonation (Business Email Compromise) relies on authority and manufactured urgency to bypass procedural financial verification."
        }
    ],
    "upi_fraud": [
        {
            "id": "q3",
            "question": "A buyer on an online marketplace says: 'I have sent you 5,000 INR. Just scan this QR code and enter your UPI PIN to receive the money.' What happens if you enter your UPI PIN?",
            "options": [
                {"key": "A", "text": "You will instantly receive 5,000 INR into your bank account"},
                {"key": "B", "text": "Your account will be debited 5,000 INR, because UPI PIN is strictly for SENDING money"},
                {"key": "C", "text": "The transaction will pause until the buyer confirms delivery"},
                {"key": "D", "text": "The money goes into an escrow account held by the government"}
            ],
            "correct": "B",
            "explanation": "GOLDEN RULE: You NEVER enter your UPI MPIN or scan a QR code to receive money. Entering your PIN always deducts funds from your account."
        },
        {
            "id": "q4",
            "question": "A caller claims to be customer support and asks you to install 'QuickSupport' or 'AnyDesk' to fix a failed transaction refund. What should you do?",
            "options": [
                {"key": "A", "text": "Install the app and share the 9-digit remote access code with the caller"},
                {"key": "B", "text": "Immediately disconnect the call and report the caller; never give strangers remote screen access"},
                {"key": "C", "text": "Install it on a computer instead of your smartphone"},
                {"key": "D", "text": "Share your debit card details so they can refund the money directly"}
            ],
            "correct": "B",
            "explanation": "Remote access apps give attackers full control over your screen, allowing them to intercept incoming OTPs and view net-banking logins."
        }
    ],
    "crypto_scams": [
        {
            "id": "q5",
            "question": "A Telegram group admin promises 500% guaranteed weekly returns on Bitcoin using an 'AI automated trading bot' if you transfer 0.1 BTC to their pool. What is this?",
            "options": [
                {"key": "A", "text": "A cutting-edge decentralized algorithmic arbitrage fund"},
                {"key": "B", "text": "A classic high-yield investment fraud / Ponzi scam; you will lose 100% of the funds"},
                {"key": "C", "text": "A legitimate community mining syndicate"},
                {"key": "D", "text": "An official promotion by crypto exchange founders"}
            ],
            "correct": "B",
            "explanation": "No legitimate investment can guarantee high profit with zero risk. Any scheme claiming guaranteed astronomical returns is a scam."
        },
        {
            "id": "q6",
            "question": "Under what circumstance should you type your 12 or 24-word crypto wallet Seed Recovery Phrase into a website?",
            "options": [
                {"key": "A", "text": "When customer support requests it to fix a stuck Ethereum transaction"},
                {"key": "B", "text": "When claiming a high-value token airdrop"},
                {"key": "C", "text": "NEVER. Typing your seed phrase on any website gives attackers total control of all your crypto assets"},
                {"key": "D", "text": "When synchronizing your mobile wallet with a desktop extension"}
            ],
            "correct": "C",
            "explanation": "Your seed recovery phrase is the master master-key to your crypto. No legitimate service, dApp, or support agent will ever ask for it."
        }
    ],
    "deepfakes": [
        {
            "id": "q7",
            "question": "You receive a phone call with your family member's voice claiming they are in a police emergency and urgently need money sent to a stranger's UPI ID. What is the safest immediate action?",
            "options": [
                {"key": "A", "text": "Immediately transfer the requested funds because voice cloning is impossible"},
                {"key": "B", "text": "Hang up and dial the family member's known direct phone number, or ask a pre-agreed family safe word"},
                {"key": "C", "text": "Post on social media asking if anyone knows where they are"},
                {"key": "D", "text": "Send half the money to be safe"}
            ],
            "correct": "B",
            "explanation": "AI voice cloning can replicate human voices with just 3 seconds of audio. Always hang up and call back on a verified phone number or use a secret family safe word."
        }
    ]
}

AWARENESS_MODULES = [
    {
        "id": "phishing",
        "title": "Phishing & Social Engineering Defense",
        "icon": "mail",
        "duration": "5 min read",
        "level": "Essential",
        "summary": "Learn how attackers craft deceptive emails and SMS messages to steal credentials and net-banking access.",
        "key_takeaways": [
            "Check sender domain carefully for typosquatting (e.g., sbi-secure.top instead of sbi.co.in).",
            "Treat urgent demands for KYC updates or immediate account blocks with suspicion.",
            "Verify all notifications via direct bookmarks or official mobile apps."
        ]
    },
    {
        "id": "upi_fraud",
        "title": "UPI & Payment Scams Protection",
        "icon": "dollar-sign",
        "duration": "6 min read",
        "level": "Critical",
        "summary": "Master the golden rules of UPI, QR code transactions, and avoiding deceptive collect requests.",
        "key_takeaways": [
            "Entering your UPI MPIN or scanning a QR code is ONLY for sending funds, never for receiving.",
            "Reject collect requests from unverified VPAs asking to 'Approve' to get a refund.",
            "Never install remote desktop apps (AnyDesk, TeamViewer) at the request of an unverified caller."
        ]
    },
    {
        "id": "crypto_scams",
        "title": "Cryptocurrency & Web3 Security",
        "icon": "shield",
        "duration": "7 min read",
        "level": "Intermediate",
        "summary": "Protect your digital assets from wallet drainers, fake token airdrops, and seed phrase theft.",
        "key_takeaways": [
            "Your 12/24-word seed phrase must never be typed online or shared with anyone.",
            "Beware of malicious dApps requesting unlimited token approvals (Permit2).",
            "Guaranteed 50x-100x return claims on Telegram or WhatsApp are 100% scams."
        ]
    },
    {
        "id": "deepfakes",
        "title": "AI & Voice-Cloning Scams",
        "icon": "cpu",
        "duration": "4 min read",
        "level": "Advanced",
        "summary": "Understand how generative AI and synthesized audio are weaponized for targeted family emergencies and CEO fraud.",
        "key_takeaways": [
            "AI voice cloning requires only a few seconds of public audio to mimic tone and cadence.",
            "Establish a private, offline 'Family Safe Word' to verify real distress emergencies.",
            "Never wire money without secondary verification over an established channel."
        ]
    }
]

@router.get("/modules")
def get_modules():
    return AWARENESS_MODULES

@router.get("/quiz/{category}")
def get_quiz_questions(category: str):
    cat = category.lower().strip()
    questions = QUIZ_QUESTION_BANK.get(cat, QUIZ_QUESTION_BANK["phishing"])
    # Strip correct answer before sending to client
    client_questions = []
    for q in questions:
        client_questions.append({
            "id": q["id"],
            "question": q["question"],
            "options": q["options"]
        })
    return {"category": cat, "questions": client_questions}

@router.post("/quiz/submit", response_model=schemas.QuizSubmitResponse)
def submit_quiz(
    req: schemas.QuizSubmitRequest,
    current_user: models.User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    cat = req.category.lower().strip()
    questions = QUIZ_QUESTION_BANK.get(cat, QUIZ_QUESTION_BANK["phishing"])
    
    total = len(questions)
    correct_count = 0
    explanations = {}

    for q in questions:
        user_ans = req.answers.get(q["id"], "").upper()
        if user_ans == q["correct"]:
            correct_count += 1
        explanations[q["id"]] = f"Correct Answer: {q['correct']}. {q['explanation']}"

    score_pct = round((correct_count / total) * 100.0, 1) if total > 0 else 0.0
    passed = score_pct >= 70.0

    # Save quiz result in db if user logged in
    if current_user:
        db_res = models.AwarenessQuizResult(
            user_id=current_user.id,
            category=cat,
            score=score_pct,
            total_questions=total,
            passed=passed,
            answers_json=json.dumps(req.answers),
            created_at=datetime.datetime.utcnow()
        )
        db.add(db_res)
        
        # Reward user security profile
        profile = db.query(models.UserSecurityProfile).filter(models.UserSecurityProfile.user_id == current_user.id).first()
        if profile and passed:
            if "phishing" in cat:
                profile.phishing_protection = min(98.0, profile.phishing_protection + 5.0)
            elif "upi" in cat:
                profile.financial_security = min(98.0, profile.financial_security + 5.0)
            profile.overall_score = round((profile.financial_security + profile.account_security + profile.phishing_protection + profile.device_security + profile.privacy_protection) / 5.0, 1)
        
        db.commit()

    return schemas.QuizSubmitResponse(
        score=score_pct,
        total=total,
        correct=correct_count,
        passed=passed,
        explanations=explanations
    )
