import React, { useState, useEffect } from "react";
import { FileText, Download, FileCode, Search, RefreshCw, ExternalLink } from "lucide-react";
import ThreatBadge from "../components/ThreatBadge";
import { api } from "../services/api";

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.reports.list();
      setReports(res || []);
    } catch (err) {
      console.error("Failed to load reports", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filtered = reports.filter(
    (r) =>
      r.threat_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.input_preview?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.report_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.25rem" }}>
            <div style={{ padding: "0.35rem", borderRadius: "8px", background: "rgba(16, 185, 129, 0.15)", color: "#10b981" }}>
              <FileText size={20} />
            </div>
            <h1 className="font-display" style={{ fontSize: "1.65rem", fontWeight: 800 }}>
              FORENSIC THREAT REPORTS & EVIDENCE DOSSIERS
            </h1>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            Export professional audit-grade security reports with forensic breakdowns, MITRE kill chains, and incident response checklists in PDF and JSON.
          </p>
        </div>

        <button onClick={fetchReports} className="cyber-btn cyber-btn-secondary" style={{ padding: "0.5rem 0.85rem" }}>
          <RefreshCw size={14} /> Refresh Reports
        </button>
      </div>

      {/* Filter Bar */}
      <div className="cyber-card" style={{ padding: "1rem" }}>
        <div style={{ display: "flex", gap: "1rem" }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search reports by ID, threat classification, or target content..."
            className="cyber-input"
          />
        </div>
      </div>

      {/* Reports Table Card */}
      <div className="cyber-card">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", color: "var(--text-muted)", fontSize: "0.75rem", textTransform: "uppercase" }}>
                <th style={{ padding: "0.85rem 1rem" }}>Report Ref</th>
                <th style={{ padding: "0.85rem 1rem" }}>Target Vector</th>
                <th style={{ padding: "0.85rem 1rem" }}>Classification</th>
                <th style={{ padding: "0.85rem 1rem" }}>Risk Rating</th>
                <th style={{ padding: "0.85rem 1rem" }}>Analyzed Input Preview</th>
                <th style={{ padding: "0.85rem 1rem" }}>Timestamp</th>
                <th style={{ padding: "0.85rem 1rem", textAlign: "right" }}>Export Options</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((r) => (
                  <tr key={r.scan_id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                    <td className="font-mono" style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "var(--cyber-cyan)" }}>
                      {r.report_id}
                    </td>
                    <td style={{ padding: "0.85rem 1rem", textTransform: "uppercase", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                      {r.scan_type}
                    </td>
                    <td style={{ padding: "0.85rem 1rem", fontWeight: 600, color: "var(--text-main)" }}>
                      {r.threat_type}
                    </td>
                    <td style={{ padding: "0.85rem 1rem" }}>
                      <ThreatBadge level={r.risk_level} />
                    </td>
                    <td className="font-mono" style={{ padding: "0.85rem 1rem", color: "var(--text-muted)", maxWidth: "260px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {r.input_preview}
                    </td>
                    <td style={{ padding: "0.85rem 1rem", color: "var(--text-muted)", fontSize: "0.75rem" }}>
                      {r.created_at?.slice(0, 16).replace("T", " ")}
                    </td>
                    <td style={{ padding: "0.85rem 1rem", textAlign: "right" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                        <a
                          href={api.reports.downloadPdfUrl(r.scan_id)}
                          target="_blank"
                          rel="noreferrer"
                          className="cyber-btn cyber-btn-primary"
                          style={{ padding: "0.3rem 0.65rem", fontSize: "0.75rem" }}
                          title="Download Official PDF Report"
                        >
                          <Download size={13} /> PDF
                        </a>
                        <a
                          href={api.reports.downloadJsonUrl(r.scan_id)}
                          target="_blank"
                          rel="noreferrer"
                          className="cyber-btn cyber-btn-secondary"
                          style={{ padding: "0.3rem 0.65rem", fontSize: "0.75rem" }}
                          title="Export JSON Metadata"
                        >
                          <FileCode size={13} /> JSON
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-muted)" }}>
                    No matching security reports found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
