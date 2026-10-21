def generate_incident_response_plan(
    incident_type: str,
    clicked_link: bool = False,
    entered_credentials: bool = False,
    shared_otp: bool = False,
    sent_payment: bool = False,
    installed_app: bool = False,
    connected_wallet: bool = False
) -> tuple[str, list[dict]]:
    """
    Evaluates incident questionnaire parameters and generates a dynamic,
    prioritized containment and recovery action plan.
    """
    actions = []
    severity = "LOW"
    step = 1

    # Check for Critical Compromise Flags
    if sent_payment or shared_otp or connected_wallet:
        severity = "CRITICAL"
    elif entered_credentials or installed_app:
        severity = "HIGH"
    elif clicked_link:
        severity = "MEDIUM"

    # Step: Financial Fraud / Immediate Fund Halt
    if sent_payment:
        actions.append({
            "step_order": step,
            "action_text": "EMERGENCY: Immediately call your bank's 24/7 fraud helpline (number on the back of your card) to request a temporary stop-payment or freeze on your net-banking / debit card.",
            "action_priority": "IMMEDIATE",
            "is_completed": False
        })
        step += 1
        actions.append({
            "step_order": step,
            "action_text": "Note down the Transaction Reference Number (UTR / Ref ID), date, time, and recipient VPA / account number for official filing.",
            "action_priority": "IMMEDIATE",
            "is_completed": False
        })
        step += 1

    # Step: OTP Disclosure
    if shared_otp:
        actions.append({
            "step_order": step,
            "action_text": "Deauthorize all active sessions and block net-banking access immediately, as the attacker may be actively authenticating a high-value transfer or password reset.",
            "action_priority": "IMMEDIATE",
            "is_completed": False
        })
        step += 1

    # Step: Credential Compromise
    if entered_credentials:
        actions.append({
            "step_order": step,
            "action_text": "Change passwords immediately for the affected service using a separate, uncompromised device. Do not reuse old passwords.",
            "action_priority": "IMMEDIATE",
            "is_completed": False
        })
        step += 1
        actions.append({
            "step_order": step,
            "action_text": "Check all secondary accounts (e.g. recovery email, phone number) if the same password was used across services.",
            "action_priority": "HIGH",
            "is_completed": False
        })
        step += 1

    # Step: Malicious App Installation
    if installed_app:
        actions.append({
            "step_order": step,
            "action_text": "Place your device in Airplane Mode (disconnect Wi-Fi and Cellular data) to prevent remote attackers from streaming your screen or receiving keystrokes.",
            "action_priority": "IMMEDIATE",
            "is_completed": False
        })
        step += 1
        actions.append({
            "step_order": step,
            "action_text": "Boot device in Safe Mode and uninstall recently downloaded APKs or remote tools (e.g., AnyDesk, TeamViewer, unknown packages). Revoke accessibility and SMS permissions.",
            "action_priority": "HIGH",
            "is_completed": False
        })
        step += 1

    # Step: Crypto Wallet Connection
    if connected_wallet:
        actions.append({
            "step_order": step,
            "action_text": "Visit a trusted approval revocation scanner (such as revoke.cash or etherscan.io/tokenapprovalchecker) to immediately revoke all unlimited token allowances.",
            "action_priority": "IMMEDIATE",
            "is_completed": False
        })
        step += 1
        actions.append({
            "step_order": step,
            "action_text": "Transfer any remaining critical assets to a newly generated hardware wallet address with a completely fresh seed phrase.",
            "action_priority": "HIGH",
            "is_completed": False
        })
        step += 1

    # Standard Essential Containment Steps
    actions.append({
        "step_order": step,
        "action_text": "Enable Multi-Factor Authentication (MFA) using an Authenticator app (e.g. Google Authenticator) or physical FIDO2 key rather than SMS wherever possible.",
        "action_priority": "HIGH",
        "is_completed": False
    })
    step += 1

    actions.append({
        "step_order": step,
        "action_text": "Preserve all original evidence: Take full screenshots of SMS messages, phone numbers, caller IDs, phishing web URLs, and email headers.",
        "action_priority": "RECOMMENDED",
        "is_completed": False
    })
    step += 1

    actions.append({
        "step_order": step,
        "action_text": "Report the cyber incident to the official national reporting portal (In India: National Cyber Crime Reporting Portal at cybercrime.gov.in / Dial 1930; In US: ic3.gov; In UK: actionfraud.police.uk).",
        "action_priority": "RECOMMENDED",
        "is_completed": False
    })

    return severity, actions
