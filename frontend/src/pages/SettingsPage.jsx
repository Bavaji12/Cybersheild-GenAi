import React, { useState } from "react";
import { Settings, Shield, Key, Lock, CheckCircle2, Save, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

export default function SettingsPage() {
  const { user } = useAuth();
  const [mfaEnabled, setMfaEnabled] = useState(user?.mfa_enabled || false);
  const [geminiKey, setGeminiKey] = useState("");
  const [vtKey, setVtKey] = useState("");
  const [savedMsg, setSavedMsg] = useState("");
  const [togglingMfa, setTogglingMfa] = useState(false);

  const handleToggleMfa = async () => {
    setTogglingMfa(true);
    try {
      const res = await api.auth.toggleMfa();
      setMfaEnabled(res.mfa_enabled);
      setSavedMsg(res.message);
      setTimeout(() => setSavedMsg(""), 3500);
    } catch (err) {
      console.error("MFA toggle error", err);
    } finally {
      setTogglingMfa(false);
    }
  };

  const handleSaveKeys = (e) => {
    e.preventDefault();
    if (geminiKey) localStorage.setItem("cybershield_gemini_key", geminiKey);
    if (vtKey) localStorage.setItem("cybershield_vt_key", vtKey);
    setSavedMsg("API preferences updated successfully!");
    setTimeout(() => setSavedMsg(""), 3500);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem", maxWidth: "900px" }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.25rem" }}>
          <div style={{ padding: "0.35rem", borderRadius: "8px", background: "rgba(0, 242, 254, 0.15)", color: "var(--cyber-cyan)" }}>
            <Settings size={20} />
          </div>
          <h1 className="font-display" style={{ fontSize: "1.65rem", fontWeight: 800 }}>
            SECURITY SETTINGS & API CONFIGURATION
          </h1>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
          Manage multi-factor authentication, personal profile credentials, and external intelligence connectors.
        </p>
      </div>

      {savedMsg && (
        <div style={{ background: "rgba(16, 185, 129, 0.15)", border: "1px solid #10b981", color: "#34d399", padding: "0.75rem 1rem", borderRadius: "8px", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <CheckCircle2 size={16} />
          <span>{savedMsg}</span>
        </div>
      )}

      {/* Profile Card */}
      <div className="cyber-card">
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <User size={18} color="var(--cyber-cyan)" />
          User Profile Information
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Username</label>
            <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-main)", marginTop: "0.25rem" }}>{user?.username || "demouser"}</div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Registered Email</label>
            <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-main)", marginTop: "0.25rem" }}>{user?.email || "user@cybershield.ai"}</div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Role Assignment</label>
            <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--cyber-cyan)", marginTop: "0.25rem", textTransform: "uppercase" }}>{user?.role || "user"}</div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Security Status</label>
            <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#34d399", marginTop: "0.25rem" }}>Active & Monitored</div>
          </div>
        </div>
      </div>

      {/* MFA Security Card */}
      <div className="cyber-card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.35rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Lock size={18} color="var(--cyber-cyan)" />
              Multi-Factor Authentication (MFA)
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              Requires a secondary authenticator verification token during login. Significantly strengthens Account Security score.
            </p>
          </div>

          <button
            onClick={handleToggleMfa}
            disabled={togglingMfa}
            className={`cyber-btn ${mfaEnabled ? "cyber-btn-secondary" : "cyber-btn-primary"}`}
          >
            {mfaEnabled ? "Disable MFA" : "Enable MFA"}
          </button>
        </div>
      </div>

      {/* External AI & Intel API Keys */}
      <div className="cyber-card">
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Key size={18} color="var(--cyber-cyan)" />
          External GenAI & Threat Intel Connectors
        </h3>
        <p style={{ fontSize: "0.825rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>
          External API Keys are entirely optional. CyberShield includes an embedded high-fidelity threat intelligence feed and native heuristic GenAI copilot reasoning engine.
        </p>

        <form onSubmit={handleSaveKeys} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.35rem" }}>
              Google Gemini API Key (Optional)
            </label>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="AIzaSy... (leave blank to use built-in local reasoner)"
              className="cyber-input font-mono"
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.35rem" }}>
              VirusTotal / AbuseIPDB API Key (Optional)
            </label>
            <input
              type="password"
              value={vtKey}
              onChange={(e) => setVtKey(e.target.value)}
              placeholder="vt_key_... (leave blank to use built-in URLhaus feed)"
              className="cyber-input font-mono"
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" className="cyber-btn cyber-btn-primary">
              <Save size={16} /> Save Connectors
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
