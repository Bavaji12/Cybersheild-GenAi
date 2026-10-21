def generate_attack_chain(threat_type: str, indicators: list[str], risk_level: str) -> list[dict]:
    """
    Generates a MITRE ATT&CK inspired progression chain tailored to the specific threat type,
    highlighting the initial vector, intermediate stages, prevention kill-chains, and target impacts.
    """
    t_lower = threat_type.lower()
    
    # 1. Banking KYC / Phishing Scam Attack Chain
    if any(k in t_lower for k in ["banking", "kyc", "sbi", "hdfc", "bank"]):
        return [
            {
                "step": 1,
                "stage": "Initial Access / Delivery",
                "title": "Deceptive Bank Smishing / Phishing Email",
                "description": "Attacker transmits an urgent message threatening account suspension or requiring mandatory KYC compliance.",
                "indicators": ["Bank moniker impersonation", "Urgency cue ('blocked today')"],
                "kill_chain_point": True,
                "prevention_action": "Do not click links inside unsolicited SMS/emails. Verify status via official banking app."
            },
            {
                "step": 2,
                "stage": "Execution / Redirection",
                "title": "Malicious Lookalike Landing Page",
                "description": "Victim clicks link and lands on a typosquatted, unverified domain mimicking official net-banking portals.",
                "indicators": ["Suspicious domain TLD", "Absence of official Extended Validation (EV) certificate"],
                "kill_chain_point": True,
                "prevention_action": "Inspect URL domain structure. Never enter credentials on non-official URLs."
            },
            {
                "step": 3,
                "stage": "Credential Harvesting",
                "title": "Net-Banking Username & Password Theft",
                "description": "Fake login form captures customer ID, password, date of birth, and mother's maiden name.",
                "indicators": ["Form posting to unauthorized endpoint", "Unencrypted / self-signed certificate"],
                "kill_chain_point": True,
                "prevention_action": "Close browser tab immediately. Enable Passkey / WebAuthn hardware authentication."
            },
            {
                "step": 4,
                "stage": "Defense Evasion & Privilege Escalation",
                "title": "Interception of Second-Factor OTP",
                "description": "Scammer prompts for 2FA SMS OTP or induces victim to install a forwarding APK / remote viewer.",
                "indicators": ["Prompt for transaction OTP without customer initiating transaction"],
                "kill_chain_point": True,
                "prevention_action": "NEVER share OTP with anyone, including bank representatives."
            },
            {
                "step": 5,
                "stage": "Impact & Exfiltration",
                "title": "Unauthorized Account Takeover & Financial Drain",
                "description": "Fraudster logs into legitimate banking portal, adds rogue beneficiary, and transfers funds.",
                "indicators": ["Unexpected debit alert", "Password change notification"],
                "kill_chain_point": False,
                "prevention_action": "Immediately contact bank fraud helpline to freeze debit cards and online access."
            }
        ]

    # 2. UPI Reverse / Collect Scam Attack Chain
    elif any(k in t_lower for k in ["upi", "collect", "refund"]):
        return [
            {
                "step": 1,
                "stage": "Social Engineering Hook",
                "title": "Payment Reversal or Lottery Claim Bait",
                "description": "Scammer contacts victim claiming accidental funds transfer or pending cashback prize.",
                "indicators": ["Urgent claim of accidental payment", "Buyer impersonation on marketplace"],
                "kill_chain_point": True,
                "prevention_action": "Refuse to issue manual refunds without bank verification."
            },
            {
                "step": 2,
                "stage": "Malicious Request Generation",
                "title": "UPI Collect Request or Malicious QR Code",
                "description": "Fraudster sends a UPI collect request or QR code misleadingly labelled 'RECEIVE_PAYMENT'.",
                "indicators": ["UPI URI scheme containing 'am' (amount) parameter", "Spoofed customer care VPA"],
                "kill_chain_point": True,
                "prevention_action": "Remember: Scanning QR codes or entering PIN is ONLY for SENDING money, never receiving."
            },
            {
                "step": 3,
                "stage": "PIN Deception",
                "title": "Victim Coerced to Enter MPIN",
                "description": "Victim assumes entering MPIN will credit funds, but it authorizes a debit from their account.",
                "indicators": ["Audio or chat instructions telling user to input PIN"],
                "kill_chain_point": True,
                "prevention_action": "Cancel transaction immediately upon seeing the UPI MPIN keypad."
            },
            {
                "step": 4,
                "stage": "Financial Impact",
                "title": "Direct Bank Account Debiting",
                "description": "Immediate irreversible deduction via Immediate Payment Service / UPI network.",
                "indicators": ["SMS debit alert from bank"],
                "kill_chain_point": False,
                "prevention_action": "Report transaction UTR number to National Cyber Crime Portal (1930 / cybercrime.gov.in)."
            }
        ]

    # 3. Cryptocurrency Investment & Wallet Drainer Attack Chain
    elif any(k in t_lower for k in ["crypto", "wallet", "seed", "airdrop"]):
        return [
            {
                "step": 1,
                "stage": "Promotion & Enticement",
                "title": "Guaranteed Returns or VIP Airdrop Claim",
                "description": "Attacker promotes high-yield trading schemes or exclusive token giveaways on social platforms.",
                "indicators": ["Guaranteed ROI claims", "Impersonation of crypto influencers"],
                "kill_chain_point": True,
                "prevention_action": "Ignore unsolicited crypto investment advice and giveaways."
            },
            {
                "step": 2,
                "stage": "Web3 Contract / Wallet Interaction",
                "title": "Malicious dApp or Phishing Webpage",
                "description": "Victim is directed to a lookalike Web3 site requesting wallet connection (MetaMask, Phantom, etc.).",
                "indicators": ["Permit2 / Unlimited token approval function request", "Untrusted smart contract address"],
                "kill_chain_point": True,
                "prevention_action": "Review smart contract permissions before approving transactions."
            },
            {
                "step": 3,
                "stage": "Credential / Key Extraction",
                "title": "Secret Recovery Seed Phrase Solicitation",
                "description": "Site prompts victim for 12/24-word mnemonic phrase to 'synchronize' or 'verify' the wallet.",
                "indicators": ["Plaintext input fields for mnemonic recovery phrase"],
                "kill_chain_point": True,
                "prevention_action": "NEVER type your seed phrase anywhere online or share it with anyone."
            },
            {
                "step": 4,
                "stage": "Asset Exfiltration",
                "title": "Automated Token & NFT Drain",
                "description": "Automated drainer scripts transfer all ERC-20/SPL tokens and valuable NFTs to attacker address.",
                "indicators": ["Sweeper bot transactions detected on blockchain explorer"],
                "kill_chain_point": False,
                "prevention_action": "Revoke token approvals via revoke.cash and migrate remaining assets to a fresh hardware wallet."
            }
        ]

    # 4. Malware / Ransomware / Remote Access Tool (RAT) Attack Chain
    elif any(k in t_lower for k in ["malware", "file", "executable", "ransomware", "trojan"]):
        return [
            {
                "step": 1,
                "stage": "Payload Staging & Delivery",
                "title": "Deceptive Download or Phishing Attachment",
                "description": "Attacker packages malicious binary disguised as legitimate software, invoice, or cracked tool.",
                "indicators": ["Dangerous executable format (.exe, .scr, .apk)", "Deceptive double extension"],
                "kill_chain_point": True,
                "prevention_action": "Only download software from verified official vendors or package managers."
            },
            {
                "step": 2,
                "stage": "Execution & Defense Evasion",
                "title": "Execution of Unverified Code",
                "description": "Victim runs binary; malicious process disables antivirus protections or establishes persistence.",
                "indicators": ["Creation of autorun registry keys", "Process injection into explorer.exe"],
                "kill_chain_point": True,
                "prevention_action": "Do not override OS SmartScreen or security warnings."
            },
            {
                "step": 3,
                "stage": "Command & Control (C2)",
                "title": "Outbound Beaconing to Attacker Server",
                "description": "Infected host connects to remote C2 IP to receive tasking and send system reconnaissance.",
                "indicators": ["Unusual outbound traffic to non-standard ports or suspicious IP addresses"],
                "kill_chain_point": True,
                "prevention_action": "Disconnect network interface (Wi-Fi/Ethernet) immediately."
            },
            {
                "step": 4,
                "stage": "Action on Objectives",
                "title": "Data Exfiltration or Ransomware Encryption",
                "description": "Files are encrypted with AES/RSA algorithms, or saved browser passwords and cookies are exfiltrated.",
                "indicators": ["Ransom note text files created", "Browser credential store accessed"],
                "kill_chain_point": False,
                "prevention_action": "Restore clean backup from immutable offline storage; report incident."
            }
        ]

    # 5. Default Generic Attack Progression
    else:
        return [
            {
                "step": 1,
                "stage": "Reconnaissance & Lure",
                "title": "Unsolicited Security / Promotional Communication",
                "description": "Target is presented with an unverified stimulus requesting interaction or data verification.",
                "indicators": ["Unsolicited communication", "Generic greeting"],
                "kill_chain_point": True,
                "prevention_action": "Verify identity through an independent, verified communication channel."
            },
            {
                "step": 2,
                "stage": "Engagement & Extraction",
                "title": "Interaction with Suspicious Asset",
                "description": "Target interacts with suspicious URL, message, or file.",
                "indicators": ["Unusual permissions request", "High-pressure tactics"],
                "kill_chain_point": True,
                "prevention_action": "Terminate interaction immediately upon encountering anomaly."
            },
            {
                "step": 3,
                "stage": "Impact Mitigation",
                "title": "Defensive Containment",
                "description": "Apply immediate security controls to prevent unauthorized access or loss.",
                "indicators": ["Early alert generated by CyberShield"],
                "kill_chain_point": True,
                "prevention_action": "Audit credentials and monitor account activity."
            }
        ]
