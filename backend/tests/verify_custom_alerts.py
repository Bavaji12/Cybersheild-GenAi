import requests
import sys

# Ensure UTF-8 output on Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

queries = [
    ("bullet.bavaji@ybl", "financial"),
    ("7702675153", "financial"),
    ("9347739910", "financial"),
    ("63053259", "financial"),
    ("9502935490", "financial")
]

print("=== 1. TESTING FINANCIAL SCAN ENDPOINT ===")
for target, stype in queries:
    r = requests.post("http://127.0.0.1:8000/api/analyze/scan", json={"scan_type": stype, "content": target})
    data = r.json()
    print(f"INPUT: {target}")
    print(f"  Threat Category : {data.get('threat_category')}")
    print(f"  Risk Score      : {data.get('risk_score')} ({data.get('risk_level')})")
    print(f"  Explanation     : {data.get('explanation')}")
    print("-" * 60)

print("\n=== 2. TESTING MESSAGE SCAN ENDPOINT (UNIVERSAL CHECK) ===")
for target, _ in queries:
    r = requests.post("http://127.0.0.1:8000/api/analyze/scan", json={"scan_type": "message", "content": target})
    data = r.json()
    print(f"INPUT (as message): {target}")
    print(f"  Threat Category : {data.get('threat_category')}")
    print(f"  Risk Score      : {data.get('risk_score')} ({data.get('risk_level')})")
    print(f"  Explanation     : {data.get('explanation')}")
    print("-" * 60)

print("\n=== 3. TESTING THREAT INTEL LOOKUP ENDPOINT ===")
for target, _ in queries:
    r_intel = requests.post("http://127.0.0.1:8000/api/threat-intel/lookup", json={"indicator": target})
    data_intel = r_intel.json()
    print(f"INTEL LOOKUP: {target}")
    print(f"  Flagged         : {data_intel.get('is_flagged')}")
    print(f"  Threat Label    : {data_intel.get('threat_label')}")
    print("-" * 60)

