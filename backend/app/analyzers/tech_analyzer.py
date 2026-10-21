import re
import hashlib

SECRET_PATTERNS = [
    ("AWS Access Key", r"AKIA[0-9A-Z]{16}"),
    ("Private Encryption Key", r"-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----"),
    ("JSON Web Token (JWT)", r"eyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}"),
    ("Generic High-Entropy API Secret", r"(?i)(api[_-]?key|secret[_-]?key|access[_-]?token)[\s:=]{1,4}['\"][a-zA-Z0-9_\-]{20,}['\"]"),
    ("Database Connection String", r"(?i)(mongodb|postgres|postgresql|mysql|redis):\/\/[a-zA-Z0-9_]+:[^@\s]+@[a-zA-Z0-9.-]+"),
    ("GitHub Personal Access Token", r"gh[pous]_[A-Za-z0-9_]{36,255}"),
    ("Slack Bot Token", r"xoxb-[0-9]{11,13}-[0-9]{11,13}-[a-zA-Z0-9]{24}"),
    ("Credit Card Number", r"\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b"),
    ("Social Security / National ID Number", r"\b\d{3}-\d{2}-\d{4}\b")
]

DANGEROUS_EXTENSIONS = {
    ".exe": "Windows Executable Binary",
    ".scr": "Windows Screensaver Executable (frequent malware payload)",
    ".bat": "Windows Batch Script",
    ".cmd": "Windows Command Script",
    ".vbs": "VBScript Executable",
    ".js": "JavaScript File (script-based malware)",
    ".ps1": "PowerShell Script",
    ".iso": "Disk Image (commonly used in malware container bypass)",
    ".hta": "HTML Application",
    ".apk": "Android Package File",
    ".jar": "Java Archive Binary",
    ".dll": "Dynamic Link Library Binary"
}

KNOWN_MALICIOUS_HASHES = {
    "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855": "Test Null Sample",
    "44d88612fea8a8f36de82e1278abb02f": "EICAR Standard Anti-Virus Test File (MD5)",
    "275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0f": "EICAR Standard Test File (SHA256)",
    "aae82247f06530a514d8825fcb4712759f2d1266e5f8f8b4d830b91dfbb68078": "WannaCry Ransomware Indicator",
    "35a38891040685e130c29f27027ae4b1c7abfa1c8ff1694f414e0ad3d6a782b5": "Emotet Loader Sample"
}

def analyze_data_leak(content: str) -> dict:
    findings = []
    redacted_preview = content
    points = 0
    
    for secret_type, pattern in SECRET_PATTERNS:
        matches = re.findall(pattern, content)
        if matches:
            points += 30
            findings.append({
                "type": secret_type,
                "count": len(matches)
            })
            # Redact match for privacy
            for m in matches:
                mask = m[:3] + "********" + m[-2:] if len(m) > 5 else "********"
                redacted_preview = redacted_preview.replace(m, mask)

    score = min(100.0, float(points))
    if score >= 60:
        level = "CRITICAL"
        category = "Severe Data Leak / Secret Exposure"
        explanation = "The submitted document or message contains exposed operational credentials, private cryptography keys, or high-privilege access tokens."
        actions = [
            "Immediately revoke and rotate the exposed secrets.",
            "Review audit logs to check if credentials were leaked or accessed externally.",
            "Do NOT commit or paste these secrets into public forums, chats, or unencrypted storage."
        ]
    elif score >= 25:
        level = "MEDIUM"
        category = "Potential Sensitive Identifier Leak"
        explanation = "Detected identifiers (such as payment card patterns or API token signatures) in plaintext."
        actions = [
            "Mask or hash sensitive customer/payment data.",
            "Verify compliance with data privacy regulations (GDPR/PCI-DSS)."
        ]
    else:
        score = 0.0
        level = "SAFE"
        category = "No Sensitive Data Leaks Detected"
        explanation = "No plaintext private keys, API tokens, database credentials, or financial secrets detected."
        actions = ["Standard safe data handling."]

    return {
        "risk_score": score,
        "risk_level": level,
        "threat_category": category,
        "findings": findings,
        "redacted_preview": redacted_preview[:500] + ("..." if len(redacted_preview) > 500 else ""),
        "explanation": explanation,
        "preventive_actions": actions,
        "is_malicious": score >= 50
    }

def analyze_file_metadata(filename: str, file_bytes: bytes = b"", file_hash: str = "") -> dict:
    indicators = []
    points = 0
    filename_lower = filename.lower()
    
    # 1. Calculate SHA256 if file bytes provided
    sha256_hash = file_hash
    if file_bytes and not sha256_hash:
        sha256_hash = hashlib.sha256(file_bytes).hexdigest()

    # 2. Check Extension
    matched_ext = None
    for ext, desc in DANGEROUS_EXTENSIONS.items():
        if filename_lower.endswith(ext):
            matched_ext = ext
            points += 45
            indicators.append(f"Dangerous executable extension: {ext} ({desc})")
            break

    # 3. Check Double Extension (e.g., photo.jpg.exe or docx.vbs)
    double_ext_match = re.search(r"\.(pdf|docx?|xlsx?|jpg|png|txt)\.(exe|scr|bat|vbs|hta|js|apk)$", filename_lower)
    if double_ext_match:
        points += 40
        indicators.append(f"Deceptive double extension spoofing harmless format: '{double_ext_match.group(0)}'")

    # 4. Check Suspicious Filename keywords
    if any(k in filename_lower for k in ["bank", "kyc", "crack", "hack", "keygen", "cheat", "patch", "invoice", "payment_receipt"]):
        points += 15
        indicators.append("Filename matches known social engineering lure terminology")

    # 5. Check against Known Threat Hashes
    threat_feed_match = None
    if sha256_hash and sha256_hash.lower() in KNOWN_MALICIOUS_HASHES:
        threat_feed_match = KNOWN_MALICIOUS_HASHES[sha256_hash.lower()]
        points = 100
        indicators.append(f"CRITICAL: Hash matches confirmed malicious threat feed signature: '{threat_feed_match}'")

    score = min(100.0, float(points))
    if score >= 80:
        level = "CRITICAL"
        category = "Confirmed or High-Risk Malicious File"
        explanation = "File exhibits strong malware distribution patterns (dangerous execution types, deceptive extensions, or confirmed threat signatures)."
        actions = [
            "DO NOT open or run this file under any circumstances.",
            "Delete or quarantine the file immediately.",
            "If already executed, disconnect your computer from the network and initiate a full anti-malware scan."
        ]
    elif score >= 45:
        level = "HIGH"
        category = "Suspicious Executable File"
        explanation = "Executable format with risk of unverified code execution or payload installation."
        actions = [
            "Verify the exact download origin and code signature before execution.",
            "Run through VirusTotal or sandbox environment."
        ]
    elif score >= 20:
        level = "MEDIUM"
        category = "Uncommon File Type"
        explanation = "File format requires caution."
        actions = ["Verify file source."]
    else:
        score = 5.0
        level = "SAFE"
        category = "Standard Safe File"
        explanation = "Standard file type with no obvious executable risk indicators."
        actions = ["Standard caution."]

    return {
        "filename": filename,
        "sha256": sha256_hash or "Not provided",
        "risk_score": score,
        "risk_level": level,
        "threat_category": category,
        "indicators": indicators,
        "threat_feed_match": threat_feed_match,
        "explanation": explanation,
        "preventive_actions": actions,
        "is_malicious": score >= 50
    }

def analyze_iot_security(device_type: str, settings_dict: dict) -> dict:
    """Analyzes IoT smart device security posture based on user-provided device configuration."""
    indicators = []
    points = 0
    
    # 1. Default password check
    if settings_dict.get("default_password", False) or settings_dict.get("password") in ["admin", "123456", "password"]:
        points += 45
        indicators.append("Device using manufacturer default password (vulnerable to Mirai-style botnet brute-forcing)")

    # 2. Firmware status
    if settings_dict.get("firmware_outdated", False):
        points += 25
        indicators.append("Firmware is outdated and may contain unpatched CVE vulnerabilities")

    # 3. Remote access enabled on WAN
    if settings_dict.get("remote_wan_access", False) or settings_dict.get("upnp_enabled", False):
        points += 30
        indicators.append("Remote management or UPnP exposed to public WAN without firewall restriction")

    # 4. Unencrypted RTSP/HTTP
    if settings_dict.get("unencrypted_stream", False):
        points += 20
        indicators.append("Streaming protocol unencrypted (RTSP/HTTP video feed interception risk)")

    score = min(100.0, float(points))
    if score >= 60:
        level = "HIGH"
        category = "Critical IoT Device Vulnerability"
        actions = [
            "Change device default password to a strong, unique 16+ character passphrase.",
            "Disable UPnP and remote WAN management in router settings.",
            "Update firmware to the latest manufacturer release.",
            "Isolate IoT devices on a dedicated Guest Wi-Fi VLAN."
        ]
    elif score >= 30:
        level = "MEDIUM"
        category = "Moderate IoT Security Weakness"
        actions = [
            "Review connected device permissions and disable unused cloud access features.",
            "Ensure regular firmware updates are applied."
        ]
    else:
        score = 10.0
        level = "SAFE"
        category = "Hardened IoT Configuration"
        actions = ["Maintain current security baseline and keep firmware updated."]

    return {
        "device_type": device_type,
        "risk_score": score,
        "risk_level": level,
        "threat_category": category,
        "indicators": indicators,
        "preventive_actions": actions,
        "is_malicious": score >= 50
    }
