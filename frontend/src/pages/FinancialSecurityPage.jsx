import React, { useState } from "react";
import {
  Landmark,
  ShieldAlert,
  QrCode,
  Coins,
  AlertOctagon,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  Lock
} from "lucide-react";
import ThreatBadge from "../components/ThreatBadge";
import RiskGauge from "../components/RiskGauge";
import { api } from "../services/api";

export default function FinancialSecurityPage() {
  const [selectedSubtype, setSelectedSubtype] = useState("upi");
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const presets = {
    upi: {
      title: "UPI Collect Request & Reversal Scam",
      placeholder: "e.g., Scan QR or enter UPI PIN to receive Rs 5000 refund, or UPI note: 'Approve to receive'",
      sample: "Dear customer, your refund of Rs 3,450 is pending. Please approve the collect request on Google Pay / PhonePe and enter your UPI PIN to claim funds."
    },
    banking: {
      title: "Banking KYC & Account Deactivation Scam",
      placeholder: "e.g., Dear customer, your SBI account is blocked today. Click link to update PAN card...",
      sample: "URGENT: Your HDFC net-banking access is suspended due to PAN non-verification. Click http://hdfc-netbanking-portal.top to avoid permanent block."
    },
    qr: {
      title: "Deceptive Payment QR Code Vector",
      placeholder: "e.g., upi://pay?pa=scammer@ybl&am=9999&tn=Prize_Claim",
      sample: "upi://pay?pa=refund.desk.sbi@ybl&pn=SBI_Helpdesk&am=4999&tn=Enter_PIN_To_Claim_Refund"
    },
    crypto: {
      title: "Cryptocurrency Drainer & Seed Phrase Theft",
      placeholder: "e.g., Guaranteed 500% profit bot, or website asking for 12-word seed phrase...",
      sample: "Exclusive Binance VIP Airdrop! Connect your wallet and type your 12-word Secret Recovery Phrase to claim 500 USDT instantly with guaranteed returns."
    }
  };

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) {
      setError("Please input the financial message or transaction details.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.scan.executeScan({
        scan_type: "financial",
        content: inputText,
        metadata: { financial_subtype: selectedSubtype }
      });
      setResult(res);
    } catch (err) {
      setError(err.message || "Failed to analyze financial threat.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.25rem" }}>
          <div style={{ padding: "0.35rem", borderRadius: "8px", background: "rgba(249, 115, 22, 0.15)", color: "#f97316" }}>
            <Landmark size={20} />
          </div>
          <h1 className="font-display" style={{ fontSize: "1.65rem", fontWeight: 800 }}>
            FINANCIAL CYBERSECURITY ENGINE
          </h1>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
          Specialized defensive engine designed to intercept UPI payment fraud, fake banking KYC block alerts, QR scams, and cryptocurrency wallet drainers.
        </p>
      </div>

      {/* Domain Vector Subtypes */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
        {[
          { id: "upi", label: "UPI & Collect Fraud", icon: Landmark },
          { id: "banking", label: "Banking Scam Alert", icon: Lock },
          { id: "qr", label: "QR Payment Analysis", icon: QrCode },
          { id: "crypto", label: "Crypto & Seed Drainers", icon: Coins }
        ].map((item) => {
          const Icon = item.icon;
          const isSelected = selectedSubtype === item.id;
          return (
            <div
              key={item.id}
              onClick={() => {
                setSelectedSubtype(item.id);
                setInputText("");
                setResult(null);
              }}
              className="cyber-card"
              style={{
                cursor: "pointer",
                borderColor: isSelected ? "var(--cyber-cyan)" : "var(--border-subtle)",
                background: isSelected ? "rgba(0, 242, 254, 0.08)" : "var(--bg-glass-card)",
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                gap: "0.5rem"
              }}
            >
              <Icon size={24} color={isSelected ? "var(--cyber-cyan)" : "var(--text-secondary)"} />
              <div style={{ fontSize: "0.9rem", fontWeight: 700, color: isSelected ? "var(--text-main)" : "var(--text-secondary)" }}>
                {item.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Box */}
      <div className="cyber-card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700 }}>
            {presets[selectedSubtype].title}
          </h3>
          <button
            type="button"
            onClick={() => setInputText(presets[selectedSubtype].sample)}
            className="cyber-btn cyber-btn-secondary"
            style={{ fontSize: "0.75rem", padding: "0.35rem 0.75rem" }}
          >
            Load Realistic Scenario
          </button>
        </div>

        {error && (
          <div style={{ background: "rgba(239, 68, 68, 0.15)", color: "#fca5a5", padding: "0.75rem", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.85rem" }}>
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleAnalyze} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={presets[selectedSubtype].placeholder}
            rows={3}
            className="cyber-input font-mono"
            style={{ fontSize: "0.85rem" }}
          />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
              <HelpCircle size={14} />
              <span>CyberShield never executes transactions. Analysis is performed strictly in defensive memory.</span>
            </div>
            <button type="submit" disabled={loading} className="cyber-btn cyber-btn-primary">
              <ShieldAlert size={16} />
              <span>{loading ? "Evaluating Financial Vector..." : "Analyze Financial Threat"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Financial Result */}
      {result && (
        <div className="cyber-card" style={{ borderLeft: `6px solid ${result.risk_score >= 70 ? "var(--threat-critical)" : "var(--threat-safe)"}` }}>
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "2rem", alignItems: "center" }}>
            <RiskGauge score={result.risk_score} size={150} label="FINANCIAL RISK" />

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                <ThreatBadge level={result.risk_level} size="large" />
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Category: {result.threat_category}</span>
              </div>

              <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text-main)", marginBottom: "0.5rem" }}>
                {result.threat_category}
              </h3>

              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "1rem" }}>
                {result.explanation}
              </p>

              <div
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  padding: "0.85rem",
                  borderRadius: "8px"
                }}
              >
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#fca5a5", marginBottom: "0.35rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <AlertOctagon size={16} />
                  CRITICAL DEFENSIVE RULES:
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  {result.preventive_actions && result.preventive_actions.map((act, i) => (
                    <div key={i} style={{ fontSize: "0.8rem", color: "var(--text-main)" }}>
                      🛑 {act}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
