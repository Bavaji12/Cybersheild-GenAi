import React, { useState, useEffect } from "react";
import { UserCheck, Shield, Award, CheckCircle2, RefreshCw, KeyRound, Smartphone, Lock } from "lucide-react";
import RiskGauge from "../components/RiskGauge";
import { api } from "../services/api";

export default function RiskProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.auth.getProfile();
      setProfile(res);
    } catch (err) {
      console.error("Profile fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const data = profile || {
    overall_score: 72.0,
    financial_security: 75.0,
    account_security: 65.0,
    phishing_protection: 68.0,
    device_security: 80.0,
    privacy_protection: 72.0,
    total_scans_performed: 18,
    threats_prevented: 9,
    recommendations: [
      "Enable Multi-Factor Authentication (MFA) in settings",
      "Avoid clicking banking KYC links received over SMS",
      "Complete the UPI Scam awareness quiz to earn defensive badges"
    ]
  };

  const categories = [
    { label: "Financial Security", val: data.financial_security, desc: "Resistance to UPI collect scams, fake bank alerts, and crypto drainers" },
    { label: "Account Security", val: data.account_security, desc: "Multi-Factor Authentication (MFA) enforcement and credential hygiene" },
    { label: "Phishing Protection", val: data.phishing_protection, desc: "Detection of typosquatted domains, lookalike websites, and urgency lures" },
    { label: "Device Security", val: data.device_security, desc: "Safe file handling, malware awareness, and smart IoT device configuration" },
    { label: "Privacy Protection", val: data.privacy_protection, desc: "Safeguarding personal identifiers (PII), OTPs, and private cryptographic keys" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.25rem" }}>
          <div style={{ padding: "0.35rem", borderRadius: "8px", background: "rgba(16, 185, 129, 0.15)", color: "#10b981" }}>
            <UserCheck size={20} />
          </div>
          <h1 className="font-display" style={{ fontSize: "1.65rem", fontWeight: 800 }}>
            PERSONAL CYBER RISK PROFILE
          </h1>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
          Continuous multi-dimensional security posture tracking across financial habits, credential resilience, phishing defense, and privacy hygiene.
        </p>
      </div>

      {/* Main Score & Metric Overview */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1.5rem" }}>
        {/* Overall Security Score Card */}
        <div className="cyber-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "2rem" }}>
          <RiskGauge score={data.overall_score} size={180} label="OVERALL SECURITY SCORE" />
          <div style={{ marginTop: "1.25rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Calculated from verified defensive habits and proactive scan verification.
          </div>
        </div>

        {/* 5 Categories Bar Breakdown */}
        <div className="cyber-card">
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>
            Category Resilience Breakdown
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {categories.map((cat, idx) => (
              <div key={idx}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.25rem" }}>
                  <div>
                    <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-main)" }}>{cat.label}</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: "0.5rem" }}>{cat.desc}</span>
                  </div>
                  <span className="font-mono" style={{ fontSize: "0.85rem", fontWeight: 700, color: cat.val >= 70 ? "#34d399" : cat.val >= 50 ? "#facc15" : "#f87171" }}>
                    {cat.val} / 100
                  </span>
                </div>
                <div style={{ height: "8px", background: "rgba(255,255,255,0.06)", borderRadius: "4px", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${cat.val}%`,
                      height: "100%",
                      background: cat.val >= 70 ? "linear-gradient(90deg, #10b981, #00f2fe)" : cat.val >= 50 ? "#eab308" : "#ef4444"
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Personalized Recommendations */}
      <div className="cyber-card">
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          Personalized Posture Enhancements
        </h3>
        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
          Specific defensive improvements tailored to your threat interaction history:
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {data.recommendations && data.recommendations.map((rec, i) => (
            <div
              key={i}
              style={{
                background: "rgba(11, 15, 25, 0.6)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "8px",
                padding: "0.85rem 1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                fontSize: "0.875rem"
              }}
            >
              <CheckCircle2 size={18} color="var(--cyber-cyan)" />
              <span>{rec}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
