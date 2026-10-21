import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  Landmark,
  Cpu,
  Mail,
  Zap,
  ArrowUpRight,
  TrendingUp,
  Download,
  Sparkles,
  ExternalLink,
  RefreshCw
} from "lucide-react";
import RiskGauge from "../components/RiskGauge";
import ThreatBadge from "../components/ThreatBadge";
import { api } from "../services/api";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.dashboard.getSummary();
      setData(res);
      setError(null);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Unable to load live telemetry from backend engine.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading && !data) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "var(--cyber-cyan)" }}>
          <RefreshCw className="pulse-dot" size={24} />
          <span className="font-mono">INITIALIZING CYBERSHIELD TELEMETRY ENGINE...</span>
        </div>
      </div>
    );
  }

  const scores = data?.scores || {
    overall_risk: 62.0,
    financial_risk: 71.0,
    technology_risk: 48.0,
    identity_risk: 55.0,
    phishing_risk: 76.0
  };

  const stats = data?.stats || {
    total_scans: 28,
    threats_detected: 14,
    safe_verified: 14,
    active_incidents: 2
  };

  const alerts = data?.recent_alerts || [];
  const recs = data?.recommendations || [];
  const dist = data?.risk_distribution || { critical: 8, high: 9, medium: 5, low_safe: 12 };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Page Title & Refresh */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 className="font-display" style={{ fontSize: "1.65rem", fontWeight: 800 }}>
            CYBERSECURITY COMMAND DASHBOARD
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            Real-time multi-vector threat telemetry, financial risk monitoring, and heuristic attack intelligence.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            onClick={fetchDashboardData}
            className="cyber-btn cyber-btn-secondary"
            title="Refresh Telemetry"
            style={{ padding: "0.5rem 0.85rem" }}
          >
            <RefreshCw size={14} /> Refresh Feed
          </button>
          <button
            onClick={() => navigate("/analyzer")}
            className="cyber-btn cyber-btn-primary"
            style={{ padding: "0.5rem 1rem" }}
          >
            <Zap size={14} /> Scan New Threat
          </button>
        </div>
      </div>

      {/* Top Metric Cards & Risk Gauge */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "1.5rem" }}>
        {/* Overall Risk Card */}
        <div className="cyber-card" style={{ gridColumn: "span 4", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1.75rem" }}>
          <RiskGauge score={scores.overall_risk} size={170} label="OVERALL CYBER RISK" />
          <div style={{ marginTop: "1rem", textAlign: "center", fontSize: "0.8rem", color: "var(--text-muted)" }}>
            Composite weighted score derived from URL reputation, domain heuristics, message semantics, and threat feeds.
          </div>
        </div>

        {/* Vector Risk Breakdown Cards */}
        <div style={{ gridColumn: "span 8", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
          {/* Financial Risk */}
          <div className="cyber-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)" }}>Financial Cyber Risk</span>
              <div style={{ padding: "0.35rem", borderRadius: "6px", background: "rgba(249, 115, 22, 0.15)", color: "#f97316" }}>
                <Landmark size={18} />
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", margin: "0.75rem 0" }}>
              <span className="font-display" style={{ fontSize: "2rem", fontWeight: 800, color: scores.financial_risk >= 70 ? "#f97316" : "var(--text-main)" }}>
                {scores.financial_risk}
              </span>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>/ 100</span>
              <ThreatBadge level={scores.financial_risk >= 70 ? "HIGH" : "MEDIUM"} />
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Monitors UPI collect scams, bank KYC impersonations, and crypto wallet drainers.
            </div>
          </div>

          {/* Phishing Risk */}
          <div className="cyber-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)" }}>Phishing & Social Eng.</span>
              <div style={{ padding: "0.35rem", borderRadius: "6px", background: "rgba(239, 68, 68, 0.15)", color: "#ef4444" }}>
                <Mail size={18} />
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", margin: "0.75rem 0" }}>
              <span className="font-display" style={{ fontSize: "2rem", fontWeight: 800, color: "#ef4444" }}>
                {scores.phishing_risk}
              </span>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>/ 100</span>
              <ThreatBadge level="CRITICAL" />
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              High-frequency brand typosquatting, credential harvesting, and urgent lures detected.
            </div>
          </div>

          {/* Technology Risk */}
          <div className="cyber-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)" }}>Technology & Malware</span>
              <div style={{ padding: "0.35rem", borderRadius: "6px", background: "rgba(56, 189, 248, 0.15)", color: "var(--cyber-blue)" }}>
                <Cpu size={18} />
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", margin: "0.75rem 0" }}>
              <span className="font-display" style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-main)" }}>
                {scores.technology_risk}
              </span>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>/ 100</span>
              <ThreatBadge level={scores.technology_risk >= 60 ? "HIGH" : "MEDIUM"} />
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Audits file extensions, executable signatures, secret exposures, and IoT configurations.
            </div>
          </div>

          {/* Identity & Account Risk */}
          <div className="cyber-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)" }}>Identity Exposure Risk</span>
              <div style={{ padding: "0.35rem", borderRadius: "6px", background: "rgba(234, 179, 8, 0.15)", color: "#eab308" }}>
                <ShieldAlert size={18} />
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", margin: "0.75rem 0" }}>
              <span className="font-display" style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-main)" }}>
                {scores.identity_risk}
              </span>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>/ 100</span>
              <ThreatBadge level="MEDIUM" />
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Evaluates multi-factor authentication coverage and sensitive data exposure.
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section: Recent Security Alerts & Threat Distribution */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "1.5rem" }}>
        {/* Recent Alerts Table (Col 8) */}
        <div className="cyber-card" style={{ gridColumn: "span 8" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Recent Threats & Forensic Alerts</h3>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Real-time inspection stream from user submissions and threat feeds</p>
            </div>
            <Link to="/reports" style={{ fontSize: "0.8rem", color: "var(--cyber-cyan)", textDecoration: "none", fontWeight: 600 }}>
              View All Reports →
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {alerts.length > 0 ? (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  style={{
                    background: "rgba(11, 15, 25, 0.6)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "8px",
                    padding: "0.85rem 1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    transition: "all var(--transition-fast)"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", minWidth: 0 }}>
                    <ThreatBadge level={alert.level} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-main)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {alert.title}
                      </div>
                      <div className="font-mono" style={{ fontSize: "0.75rem", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "380px" }}>
                        {alert.preview}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
                    <span className="font-mono" style={{ fontSize: "0.8rem", fontWeight: 700, color: alert.score >= 70 ? "#ef4444" : "var(--cyber-cyan)" }}>
                      {alert.score}/100
                    </span>
                    <button
                      onClick={() => navigate(`/security-copilot?scanId=${alert.id}`)}
                      className="cyber-btn cyber-btn-secondary"
                      style={{ padding: "0.35rem 0.65rem", fontSize: "0.75rem" }}
                      title="Explain with Copilot"
                    >
                      <Sparkles size={12} color="var(--cyber-cyan)" /> Copilot
                    </button>
                    <a
                      href={api.reports.downloadPdfUrl(alert.id)}
                      target="_blank"
                      rel="noreferrer"
                      className="cyber-btn cyber-btn-secondary"
                      style={{ padding: "0.35rem 0.65rem", fontSize: "0.75rem" }}
                      title="Download Forensic PDF"
                    >
                      <Download size={12} /> PDF
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                No threats detected yet. Run a scan in the Multi-Input Analyzer.
              </div>
            )}
          </div>
        </div>

        {/* Threat Distribution & Stats (Col 4) */}
        <div style={{ gridColumn: "span 4", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Threat Distribution Bar */}
          <div className="cyber-card">
            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem" }}>Threat Severity Distribution</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "0.25rem" }}>
                  <span style={{ color: "var(--threat-critical)" }}>Critical Severity (80-100)</span>
                  <span className="font-mono">{dist.critical} events</span>
                </div>
                <div style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ width: `${Math.min(100, (dist.critical / 25) * 100)}%`, height: "100%", background: "#ef4444" }} />
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "0.25rem" }}>
                  <span style={{ color: "var(--threat-high)" }}>High Risk (60-80)</span>
                  <span className="font-mono">{dist.high} events</span>
                </div>
                <div style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ width: `${Math.min(100, (dist.high / 25) * 100)}%`, height: "100%", background: "#f97316" }} />
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "0.25rem" }}>
                  <span style={{ color: "var(--threat-medium)" }}>Medium Risk (40-60)</span>
                  <span className="font-mono">{dist.medium} events</span>
                </div>
                <div style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ width: `${Math.min(100, (dist.medium / 25) * 100)}%`, height: "100%", background: "#eab308" }} />
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "0.25rem" }}>
                  <span style={{ color: "var(--threat-safe)" }}>Verified Safe (0-40)</span>
                  <span className="font-mono">{dist.low_safe} events</span>
                </div>
                <div style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ width: `${Math.min(100, (dist.low_safe / 25) * 100)}%`, height: "100%", background: "#10b981" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="cyber-card">
            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem" }}>Telemetry Snapshot</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div style={{ background: "rgba(0,0,0,0.25)", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>TOTAL ANALYZED</div>
                <div className="font-display" style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-main)" }}>
                  {stats.total_scans}
                </div>
              </div>
              <div style={{ background: "rgba(0,0,0,0.25)", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>THREATS BLOCKED</div>
                <div className="font-display" style={{ fontSize: "1.4rem", fontWeight: 800, color: "#ef4444" }}>
                  {stats.threats_detected}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Security Recommendations */}
      <div className="cyber-card">
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          Active Defensive Recommendations
        </h3>
        <p style={{ fontSize: "0.825rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
          Context-aware guidance generated by CyberShield heuristic rules and user posture telemetry.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
          {recs.map((rec, idx) => (
            <div
              key={idx}
              style={{
                background: "rgba(11, 15, 25, 0.6)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "8px",
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--cyber-cyan)" }}>
                    {rec.category}
                  </span>
                  <span
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      color: rec.priority === "HIGH" ? "#f97316" : "var(--text-muted)",
                      background: "rgba(255,255,255,0.05)",
                      padding: "0.15rem 0.4rem",
                      borderRadius: "4px"
                    }}
                  >
                    {rec.priority} PRIORITY
                  </span>
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.45 }}>
                  {rec.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
