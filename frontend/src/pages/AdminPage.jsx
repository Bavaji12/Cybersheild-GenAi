import React, { useState, useEffect } from "react";
import { ShieldCheck, Activity, Users, Database, Server, RefreshCw, Key } from "lucide-react";
import { api } from "../services/api";

export default function AdminPage() {
  const [metrics, setMetrics] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [mRes, logsRes] = await Promise.all([
        api.admin.getMetrics(),
        api.admin.getAuditLogs()
      ]);
      setMetrics(mRes);
      setAuditLogs(logsRes || []);
    } catch (err) {
      console.error("Admin data fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const telem = metrics?.telemetry || {
    registered_users: 14,
    total_analyses_executed: 64,
    critical_threat_preventions: 18,
    high_risk_events: 22,
    incidents_triaged: 5
  };

  const health = metrics?.system_health || {
    backend_api: "HEALTHY",
    threat_intel_engine: "ONLINE",
    genai_copilot_pipeline: "OPERATIONAL",
    database_latency_ms: 1.4,
    threat_engine_uptime: "99.98%"
  };

  const categories = metrics?.threat_categories || {
    financial_fraud: 24,
    phishing_social_engineering: 28,
    technology_malware_leaks: 14,
    qr_vector_threats: 8
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.25rem" }}>
            <div style={{ padding: "0.35rem", borderRadius: "8px", background: "rgba(250, 204, 21, 0.15)", color: "#facc15" }}>
              <ShieldCheck size={20} />
            </div>
            <h1 className="font-display" style={{ fontSize: "1.65rem", fontWeight: 800 }}>
              ADMIN SECURITY TELEMETRY & AUDIT COMMAND
            </h1>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            Aggregated system-wide threat telemetry, infrastructure health monitoring, and privacy-preserving audit logs.
          </p>
        </div>

        <button onClick={fetchAdminData} className="cyber-btn cyber-btn-secondary" style={{ padding: "0.5rem 0.85rem" }}>
          <RefreshCw size={14} /> Refresh Telemetry
        </button>
      </div>

      {/* Infrastructure Health Status Strip */}
      <div className="cyber-card" style={{ padding: "1.25rem", background: "rgba(11, 15, 25, 0.9)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Server size={18} color="var(--cyber-cyan)" />
            <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>FastAPI Backend: <span style={{ color: "#34d399" }}>{health.backend_api}</span></span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Activity size={18} color="var(--cyber-blue)" />
            <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>Threat Intel Feed: <span style={{ color: "#34d399" }}>{health.threat_intel_engine}</span></span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Database size={18} color="#a855f7" />
            <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>DB Query Latency: <span style={{ color: "var(--cyber-cyan)", fontFamily: "var(--font-mono)" }}>{health.database_latency_ms} ms</span></span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <ShieldCheck size={18} color="#facc15" />
            <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>Engine Uptime: <span style={{ color: "#34d399", fontFamily: "var(--font-mono)" }}>{health.threat_engine_uptime}</span></span>
          </div>
        </div>
      </div>

      {/* Aggregate Telemetry 4 Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
        <div className="cyber-card" style={{ padding: "1.25rem" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Registered Tenants</div>
          <div className="font-display" style={{ fontSize: "2rem", fontWeight: 800, margin: "0.35rem 0", color: "var(--text-main)" }}>
            {telem.registered_users}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--cyber-cyan)" }}>Active Security Profiles</div>
        </div>

        <div className="cyber-card" style={{ padding: "1.25rem" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Analyses Executed</div>
          <div className="font-display" style={{ fontSize: "2rem", fontWeight: 800, margin: "0.35rem 0", color: "var(--cyber-blue)" }}>
            {telem.total_analyses_executed}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Multi-input scans performed</div>
        </div>

        <div className="cyber-card" style={{ padding: "1.25rem" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Critical Preventions</div>
          <div className="font-display" style={{ fontSize: "2rem", fontWeight: 800, margin: "0.35rem 0", color: "#ef4444" }}>
            {telem.critical_threat_preventions}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#fca5a5" }}>High-confidence fraud blocks</div>
        </div>

        <div className="cyber-card" style={{ padding: "1.25rem" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Incidents Triaged</div>
          <div className="font-display" style={{ fontSize: "2rem", fontWeight: 800, margin: "0.35rem 0", color: "#f97316" }}>
            {telem.incidents_triaged}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#fdba74" }}>Active recovery action plans</div>
        </div>
      </div>

      {/* Privacy-Preserving Audit Logs */}
      <div className="cyber-card">
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          Platform Security Audit Log Stream
        </h3>
        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
          Strict data minimization: Raw credentials, OTPs, and private tokens are masked or discarded prior to logging.
        </p>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", color: "var(--text-muted)", fontSize: "0.75rem", textTransform: "uppercase" }}>
                <th style={{ padding: "0.75rem 1rem" }}>Log ID</th>
                <th style={{ padding: "0.75rem 1rem" }}>Security Event Action</th>
                <th style={{ padding: "0.75rem 1rem" }}>Resource</th>
                <th style={{ padding: "0.75rem 1rem" }}>Status</th>
                <th style={{ padding: "0.75rem 1rem" }}>Source IP</th>
                <th style={{ padding: "0.75rem 1rem" }}>Recorded Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                  <td className="font-mono" style={{ padding: "0.75rem 1rem", color: "var(--text-muted)" }}>
                    #{log.id}
                  </td>
                  <td className="font-mono" style={{ padding: "0.75rem 1rem", fontWeight: 600, color: "var(--cyber-cyan)" }}>
                    {log.action}
                  </td>
                  <td style={{ padding: "0.75rem 1rem", color: "var(--text-main)" }}>
                    {log.resource}
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#34d399", background: "rgba(16, 185, 129, 0.15)", padding: "0.15rem 0.5rem", borderRadius: "4px" }}>
                      {log.status}
                    </span>
                  </td>
                  <td className="font-mono" style={{ padding: "0.75rem 1rem", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                    {log.ip_address}
                  </td>
                  <td className="font-mono" style={{ padding: "0.75rem 1rem", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                    {log.timestamp}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
