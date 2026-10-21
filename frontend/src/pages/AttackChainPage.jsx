import React, { useState, useEffect } from "react";
import { GitFork, Shield, AlertTriangle, ArrowRight, Layers, CheckCircle2 } from "lucide-react";
import AttackChainVisualizer from "../components/AttackChainVisualizer";
import { api } from "../services/api";

export default function AttackChainPage() {
  const [selectedThreat, setSelectedThreat] = useState("Banking KYC Phishing Scam");
  const [chain, setChain] = useState([]);
  const [loading, setLoading] = useState(false);

  const threatScenarios = [
    {
      label: "Banking KYC Phishing & OTP Theft",
      category: "Banking Phishing Scam",
      indicators: ["Bank impersonation", "Urgent SMS lure", "Punycode domain", "OTP solicitation"]
    },
    {
      label: "UPI Payment Reversal & MPIN Fraud",
      category: "UPI Reverse / Collect Scam",
      indicators: ["Fake refund note", "Collect request with amount", "Coercion to enter MPIN"]
    },
    {
      label: "Crypto Airdrop & Seed Phrase Drainer",
      category: "Cryptocurrency Fraud / Seed Theft",
      indicators: ["Guaranteed 50x profit", "Unlimited permit approval", "Seed phrase request"]
    },
    {
      label: "Disguised Executable & Ransomware",
      category: "Malware / Ransomware Executable",
      indicators: ["Double extension .pdf.exe", "Obfuscated script", "C2 beaconing"]
    }
  ];

  const fetchAttackChain = async (threatCategory, inds) => {
    setLoading(true);
    try {
      const res = await api.attackChain.generate({
        threat_category: threatCategory,
        indicators: inds,
        risk_level: "HIGH"
      });
      setChain(res.chain || []);
    } catch (err) {
      console.error("Attack chain generation error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const defaultScenario = threatScenarios[0];
    fetchAttackChain(defaultScenario.category, defaultScenario.indicators);
  }, []);

  const handleSelectScenario = (scen) => {
    setSelectedThreat(scen.label);
    fetchAttackChain(scen.category, scen.indicators);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.25rem" }}>
          <div style={{ padding: "0.35rem", borderRadius: "8px", background: "rgba(236, 72, 153, 0.15)", color: "#ec4899" }}>
            <GitFork size={20} />
          </div>
          <h1 className="font-display" style={{ fontSize: "1.65rem", fontWeight: 800 }}>
            ATTACK CHAIN & KILL-CHAIN ANALYZER
          </h1>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
          Visually traces cyber attack progression from the initial delivery vector through credential harvesting to final impact, identifying critical defensive kill-chain containment points.
        </p>
      </div>

      {/* Scenario Selector Tabs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
        {threatScenarios.map((scen, idx) => {
          const isSelected = selectedThreat === scen.label;
          return (
            <div
              key={idx}
              onClick={() => handleSelectScenario(scen)}
              className="cyber-card"
              style={{
                cursor: "pointer",
                padding: "1rem",
                borderColor: isSelected ? "var(--cyber-cyan)" : "var(--border-subtle)",
                background: isSelected ? "rgba(0, 242, 254, 0.08)" : "var(--bg-glass-card)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                <Layers size={16} color={isSelected ? "var(--cyber-cyan)" : "var(--text-muted)"} />
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: isSelected ? "var(--text-main)" : "var(--text-secondary)" }}>
                  {scen.label}
                </span>
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                {scen.indicators.join(" • ")}
              </div>
            </div>
          );
        })}
      </div>

      {/* Attack Chain Visualizer */}
      <div className="cyber-card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700 }}>
              Kill-Chain Progression: {selectedThreat}
            </h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Cyan highlighted nodes represent verified interception points where decisive user action breaks the attack sequence.
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--cyber-cyan)" }}>
            Computing MITRE ATT&CK progression stages...
          </div>
        ) : (
          <AttackChainVisualizer chain={chain} />
        )}
      </div>
    </div>
  );
}
