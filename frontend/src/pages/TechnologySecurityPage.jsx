import React, { useState } from "react";
import {
  Cpu,
  FileCode,
  Key,
  Wifi,
  Globe,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Zap,
  Server
} from "lucide-react";
import ThreatBadge from "../components/ThreatBadge";
import RiskGauge from "../components/RiskGauge";
import { api } from "../services/api";

export default function TechnologySecurityPage() {
  const [activeTab, setActiveTab] = useState("data_leak");
  const [content, setContent] = useState("");
  const [iotDevice, setIotDevice] = useState("IP Camera");
  const [iotDefaultPwd, setIotDefaultPwd] = useState(true);
  const [iotUpnp, setIotUpnp] = useState(true);
  const [iotFirmware, setIotFirmware] = useState(true);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const presets = {
    data_leak: 'export AWS_SECRET_ACCESS_KEY="AKIAIOSFODNN7EXAMPLE"\nexport DB_PASSWORD="SuperSecretPassword2026!"\nexport JWT_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiYWRtaW4ifQ.somesignature"',
    file: "payment_receipt_october2026.pdf.exe",
    phishing: "http://sbi-secure-portal.top/verification?token=admin"
  };

  const handleRunAnalysis = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let payload;
      if (activeTab === "iot") {
        payload = {
          scan_type: "iot",
          content: `IoT Security Assessment: ${iotDevice}`,
          metadata: {
            device_type: iotDevice,
            default_password: iotDefaultPwd,
            upnp_enabled: iotUpnp,
            firmware_outdated: iotFirmware
          }
        };
      } else {
        if (!content.trim()) {
          setError("Please input the content or file name to inspect.");
          setLoading(false);
          return;
        }
        payload = {
          scan_type: activeTab,
          content: content,
          metadata: { filename: content }
        };
      }

      const res = await api.scan.executeScan(payload);
      setResult(res);
    } catch (err) {
      setError(err.message || "Failed to complete technology threat inspection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.25rem" }}>
          <div style={{ padding: "0.35rem", borderRadius: "8px", background: "rgba(56, 189, 248, 0.15)", color: "var(--cyber-blue)" }}>
            <Cpu size={20} />
          </div>
          <h1 className="font-display" style={{ fontSize: "1.65rem", fontWeight: 800 }}>
            TECHNOLOGY CYBERSECURITY ENGINE
          </h1>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
          Audits technical attack vectors: data leaks & secrets, file metadata & double extensions, and smart IoT device configurations.
        </p>
      </div>

      {/* Tabs */}
      <div className="tab-group">
        {[
          { id: "data_leak", label: "Data Leak & Secret Scanner", icon: Key },
          { id: "file", label: "Malware & File Metadata", icon: FileCode },
          { id: "iot", label: "IoT Security Audit", icon: Wifi }
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => {
                setActiveTab(t.id);
                setContent("");
                setResult(null);
              }}
              className={`tab-btn ${isActive ? "active" : ""}`}
            >
              <Icon size={16} color={isActive ? "var(--cyber-cyan)" : "currentColor"} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Input Card */}
      <div className="cyber-card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>
            {activeTab === "data_leak" && "Scan for Exposed Passwords, API Keys, and Private Tokens"}
            {activeTab === "file" && "Inspect Filename, Executable Extensions, and Malware Signatures"}
            {activeTab === "iot" && "Audit Smart Device Posture & Configuration Weaknesses"}
          </h3>

          {activeTab !== "iot" && (
            <button
              type="button"
              onClick={() => setContent(presets[activeTab] || "")}
              className="cyber-btn cyber-btn-secondary"
              style={{ fontSize: "0.75rem", padding: "0.35rem 0.75rem" }}
            >
              Load Vulnerable Sample
            </button>
          )}
        </div>

        {error && (
          <div style={{ background: "rgba(239, 68, 68, 0.15)", color: "#fca5a5", padding: "0.75rem", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.85rem" }}>
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleRunAnalysis} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {activeTab === "iot" ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.35rem" }}>
                  Device Type
                </label>
                <select
                  value={iotDevice}
                  onChange={(e) => setIotDevice(e.target.value)}
                  className="cyber-input"
                >
                  <option value="IP Camera / CCTV">IP Camera / CCTV</option>
                  <option value="Wi-Fi Router / Gateway">Wi-Fi Router / Gateway</option>
                  <option value="Smart Lock / Security Hub">Smart Lock / Security Hub</option>
                  <option value="Smart Thermostat / Sensor">Smart Thermostat / Sensor</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", justifyContent: "center" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={iotDefaultPwd}
                    onChange={(e) => setIotDefaultPwd(e.target.checked)}
                  />
                  <span>Using factory default administrator password</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={iotUpnp}
                    onChange={(e) => setIotUpnp(e.target.checked)}
                  />
                  <span>UPnP or Remote WAN management enabled</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={iotFirmware}
                    onChange={(e) => setIotFirmware(e.target.checked)}
                  />
                  <span>Firmware has not been updated in &gt; 6 months</span>
                </label>
              </div>
            </div>
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={activeTab === "data_leak" ? "Paste code, log file, or document to detect secrets..." : "Enter filename or upload file hash..."}
              rows={activeTab === "data_leak" ? 4 : 2}
              className="cyber-input font-mono"
              style={{ fontSize: "0.85rem" }}
            />
          )}

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" disabled={loading} className="cyber-btn cyber-btn-primary">
              <Zap size={16} />
              <span>{loading ? "Inspecting Technical Vector..." : "Run Tech Security Audit"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Result Card */}
      {result && (
        <div className="cyber-card" style={{ borderLeft: `6px solid ${result.risk_score >= 60 ? "var(--threat-critical)" : "var(--threat-safe)"}` }}>
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "2rem", alignItems: "center" }}>
            <RiskGauge score={result.risk_score} size={150} label="TECH RISK" />

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                <ThreatBadge level={result.risk_level} size="large" />
                <span className="font-mono" style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  {result.threat_category}
                </span>
              </div>

              <h3 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "0.5rem" }}>
                {result.threat_category}
              </h3>

              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "1rem" }}>
                {result.explanation}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {result.preventive_actions && result.preventive_actions.map((act, i) => (
                  <div key={i} style={{ fontSize: "0.825rem", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <ShieldCheck size={16} color="var(--cyber-cyan)" />
                    <span>{act}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
