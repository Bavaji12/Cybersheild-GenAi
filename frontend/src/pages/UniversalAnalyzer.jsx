import React, { useState } from "react";
import {
  Globe,
  Mail,
  Landmark,
  QrCode,
  Image,
  FileCode,
  Key,
  Zap,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Download,
  Sparkles,
  Bot,
  ArrowRight,
  GitFork
} from "lucide-react";
import RiskGauge from "../components/RiskGauge";
import ThreatBadge from "../components/ThreatBadge";
import AttackChainVisualizer from "../components/AttackChainVisualizer";
import { api } from "../services/api";

export default function UniversalAnalyzer() {
  const [activeTab, setActiveTab] = useState("url");
  const [inputContent, setInputContent] = useState("");
  const [senderInfo, setSenderInfo] = useState("");
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const tabs = [
    { id: "url", label: "URL & Website", icon: Globe },
    { id: "email", label: "Email & SMS Phishing", icon: Mail },
    { id: "financial", label: "UPI & Financial Scam", icon: Landmark },
    { id: "qr", label: "QR Code Payload", icon: QrCode },
    { id: "screenshot", label: "Screenshot OCR Text", icon: Image },
    { id: "file", label: "File Metadata & Malware", icon: FileCode },
    { id: "data_leak", label: "Data Leak & Secrets", icon: Key }
  ];

  const sampleInputs = {
    url: "http://sbi-netbanking-verify.xyz/login.php?client=sbi",
    email: "Dear SBI customer, your account will be blocked today due to pending KYC. Update PAN card immediately to avoid penalty: http://sbi-kyc-verify.online",
    financial: "You have received a cashback refund of Rs 4,999 from PhonePe! Scan this QR or enter your UPI PIN to receive the money into your account immediately.",
    qr: "upi://pay?pa=refund.desk.sbi@ybl&pn=SBI_Helpdesk&am=4999&tn=Enter_PIN_To_Claim_Refund",
    screenshot: "ALERT: Immediate action required. Your debit card has been disabled. Call fraud desk at +91-9876543210 or approve collect request from support.verify@oksbi to restore service.",
    file: "annual_bonus_details.pdf.exe",
    data_leak: 'AWS_ACCESS_KEY_ID = "AKIAIOSFODNN7EXAMPLE"\nDATABASE_URL = "postgres://root:SuperSecretP@ssword123@prod-cluster.internal:5432/finance"\nJWT_SECRET = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"'
  };

  const handleLoadSample = () => {
    setInputContent(sampleInputs[activeTab] || "");
    if (activeTab === "email") {
      setSenderInfo("+91-9823412093 (Unverified Personal Number)");
    } else if (activeTab === "file") {
      setFileName("annual_bonus_details.pdf.exe");
    }
  };

  const handleRunAnalysis = async (e) => {
    if (e) e.preventDefault();
    if (!inputContent.trim()) {
      setError("Please enter or paste content to analyze.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        scan_type: activeTab,
        content: inputContent,
        metadata: {
          sender: senderInfo,
          filename: fileName || inputContent
        }
      };

      const scanResult = await api.scan.executeScan(payload);
      setResult(scanResult);
    } catch (err) {
      console.error("Scan error:", err);
      setError(err.message || "Threat inspection failed. Ensure backend engine is online.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Header */}
      <div>
        <h1 className="font-display" style={{ fontSize: "1.65rem", fontWeight: 800 }}>
          MULTI-INPUT THREAT ANALYZER
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
          Inspect URLs, phishing emails, SMS, UPI collect requests, QR codes, file signatures, and exposed API secrets with heuristic risk scoring.
        </p>
      </div>

      {/* Input Tab Selector */}
      <div className="tab-group">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setInputContent("");
                setError(null);
              }}
              className={`tab-btn ${isActive ? "active" : ""}`}
            >
              <Icon size={16} color={isActive ? "var(--cyber-cyan)" : "currentColor"} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Input Form Card */}
      <div className="cyber-card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Zap size={18} color="var(--cyber-cyan)" />
            <span style={{ fontSize: "0.95rem", fontWeight: 700 }}>
              {tabs.find((t) => t.id === activeTab)?.label} Inspection Vector
            </span>
          </div>

          <button
            onClick={handleLoadSample}
            type="button"
            className="cyber-btn cyber-btn-secondary"
            style={{ fontSize: "0.75rem", padding: "0.35rem 0.75rem" }}
          >
            Load Realistic Threat Sample
          </button>
        </div>

        {error && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              color: "#fca5a5",
              padding: "0.75rem 1rem",
              borderRadius: "8px",
              marginBottom: "1rem",
              fontSize: "0.85rem"
            }}
          >
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleRunAnalysis} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {activeTab === "email" && (
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.35rem" }}>
                Sender Phone / Email (Optional)
              </label>
              <input
                type="text"
                value={senderInfo}
                onChange={(e) => setSenderInfo(e.target.value)}
                placeholder="+91-9876543210 or urgent-alert@bank-update.xyz"
                className="cyber-input"
              />
            </div>
          )}

          {activeTab === "file" && (
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.35rem" }}>
                Target Filename / Extension
              </label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="e.g. statement_2026.pdf.exe or kyc_setup.apk"
                className="cyber-input"
              />
            </div>
          )}

          <div>
            <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.35rem" }}>
              Input Content to Inspect (Never execute malicious code; text is safely evaluated in memory)
            </label>
            <textarea
              value={inputContent}
              onChange={(e) => setInputContent(e.target.value)}
              placeholder={
                activeTab === "url"
                  ? "https://example-banking-login.com"
                  : activeTab === "financial"
                  ? "Paste suspicious UPI message, payment request, or crypto investment lure..."
                  : activeTab === "qr"
                  ? "Paste decoded QR text or upi://pay URI string..."
                  : activeTab === "data_leak"
                  ? "Paste document/code snippet to scan for accidental secret or credential leaks..."
                  : "Paste text content..."
              }
              rows={activeTab === "url" ? 2 : 4}
              className="cyber-input font-mono"
              style={{ fontSize: "0.85rem" }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="submit"
              disabled={loading}
              className="cyber-btn cyber-btn-primary"
              style={{ padding: "0.75rem 1.5rem" }}
            >
              {loading ? (
                <>
                  <Zap className="pulse-dot" size={16} /> Evaluating Security Signatures...
                </>
              ) : (
                <>
                  <Zap size={16} /> Execute Deep Security Analysis
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Analysis Results */}
      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Top Result Banner */}
          <div className="cyber-card" style={{ borderLeft: `6px solid ${result.risk_score >= 80 ? "var(--threat-critical)" : result.risk_score >= 60 ? "var(--threat-high)" : "var(--threat-safe)"}` }}>
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: "1.5rem", alignItems: "center" }}>
              <RiskGauge score={result.risk_score} size={150} label="THREAT SCORE" />

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                  <ThreatBadge level={result.risk_level} size="large" />
                  <span className="font-mono" style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    SCAN ID: CS-{result.scan_id || "9901"}
                  </span>
                </div>

                <h2 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "0.4rem" }}>
                  {result.threat_category}
                </h2>

                <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "0.75rem" }}>
                  {result.explanation}
                </p>

                <div className="font-mono" style={{ fontSize: "0.75rem", color: "var(--text-muted)", background: "rgba(0,0,0,0.3)", padding: "0.35rem 0.65rem", borderRadius: "4px", display: "inline-block" }}>
                  Target: {result.input_preview}
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <a
                  href={api.reports.downloadPdfUrl(result.scan_id || 1)}
                  target="_blank"
                  rel="noreferrer"
                  className="cyber-btn cyber-btn-primary"
                  style={{ fontSize: "0.8rem", padding: "0.5rem 0.9rem" }}
                >
                  <Download size={14} /> Download PDF Dossier
                </a>
                <a
                  href={api.reports.downloadJsonUrl(result.scan_id || 1)}
                  target="_blank"
                  rel="noreferrer"
                  className="cyber-btn cyber-btn-secondary"
                  style={{ fontSize: "0.8rem", padding: "0.5rem 0.9rem" }}
                >
                  <FileCode size={14} /> Export JSON Data
                </a>
              </div>
            </div>
          </div>

          {/* Indicators & Score Breakdown Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            {/* Forensic Indicators */}
            <div className="cyber-card">
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <ShieldAlert size={18} color={result.risk_score >= 60 ? "var(--threat-critical)" : "var(--cyber-cyan)"} />
                Forensic Indicators Detected ({result.indicators?.length || 0})
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {result.indicators && result.indicators.length > 0 ? (
                  result.indicators.map((ind, i) => (
                    <div
                      key={i}
                      style={{
                        background: "rgba(11, 15, 25, 0.7)",
                        border: "1px solid var(--border-subtle)",
                        padding: "0.6rem 0.85rem",
                        borderRadius: "6px",
                        fontSize: "0.825rem",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.5rem"
                      }}
                    >
                      <span style={{ color: "var(--threat-critical)", fontWeight: 700 }}>[FLAG]</span>
                      <span style={{ color: "var(--text-main)" }}>{ind}</span>
                    </div>
                  ))
                ) : (
                  <div style={{ color: "var(--threat-safe)", fontSize: "0.85rem" }}>
                    ✓ No anomalous heuristic signatures found.
                  </div>
                )}
              </div>
            </div>

            {/* Score Breakdown (Module 6 Factor Matrix) */}
            <div className="cyber-card">
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Zap size={18} color="var(--cyber-cyan)" />
                Unified Risk Factor Breakdown
              </h3>

              {result.score_breakdown && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                  {[
                    { label: "URL Reputation (20%)", val: result.score_breakdown.url_reputation },
                    { label: "Message Indicators (20%)", val: result.score_breakdown.message_indicators },
                    { label: "Domain Analysis (15%)", val: result.score_breakdown.domain_analysis },
                    { label: "Financial Indicators (20%)", val: result.score_breakdown.financial_indicators },
                    { label: "Threat Intelligence (15%)", val: result.score_breakdown.threat_intelligence }
                  ].map((f, idx) => (
                    <div key={idx}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "0.2rem" }}>
                        <span style={{ color: "var(--text-secondary)" }}>{f.label}</span>
                        <span className="font-mono" style={{ fontWeight: 700 }}>{f.val} / 100</span>
                      </div>
                      <div style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
                        <div
                          style={{
                            width: `${Math.min(100, f.val)}%`,
                            height: "100%",
                            background: f.val >= 70 ? "#ef4444" : f.val >= 40 ? "#f97316" : "var(--cyber-cyan)"
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* CyberShield Copilot Guidance Box */}
          {result.copilot_explanation && (
            <div className="cyber-card" style={{ background: "rgba(18, 26, 46, 0.9)", border: "1px solid var(--border-cyber)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <Bot size={20} color="var(--cyber-cyan)" />
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--cyber-cyan)" }}>
                  CyberShield Security Copilot Analysis & Defensive Plan
                </h3>
              </div>

              <div
                style={{
                  fontSize: "0.875rem",
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                  whiteSpace: "pre-line"
                }}
              >
                {result.copilot_explanation}
              </div>
            </div>
          )}

          {/* Attack Chain Visualizer */}
          {result.attack_chain && result.attack_chain.length > 0 && (
            <div className="cyber-card">
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <GitFork size={20} color="var(--cyber-cyan)" />
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>
                  MITRE-Inspired Attack Progression & Containment Points
                </h3>
              </div>
              <AttackChainVisualizer chain={result.attack_chain} />
            </div>
          )}

          {/* Preventive & Recovery Actions */}
          <div className="cyber-card">
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <CheckCircle2 size={18} color="var(--cyber-cyan)" />
              Prioritized Defensive Actions
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {result.preventive_actions && result.preventive_actions.map((act, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.5rem",
                    fontSize: "0.85rem",
                    color: "var(--text-main)"
                  }}
                >
                  <span style={{ color: "var(--cyber-cyan)", fontWeight: 700 }}>✓</span>
                  <span>{act}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
