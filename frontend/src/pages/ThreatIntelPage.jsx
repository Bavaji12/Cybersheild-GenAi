import React, { useState, useEffect } from "react";
import { GlobeLock, Search, ShieldAlert, CheckCircle, ExternalLink, RefreshCw, Zap } from "lucide-react";
import ThreatBadge from "../components/ThreatBadge";
import { api } from "../services/api";

export default function ThreatIntelPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const [feed, setFeed] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(true);

  const fetchFeed = async () => {
    try {
      setLoadingFeed(true);
      const res = await api.intel.getFeed();
      setFeed(res.indicators || []);
    } catch (err) {
      console.error("Failed to load threat feed", err);
    } finally {
      setLoadingFeed(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchTerm.trim()) return;
    setSearching(true);
    try {
      const res = await api.intel.lookup({ indicator: searchTerm });
      setSearchResult(res);
    } catch (err) {
      console.error("Lookup error", err);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.25rem" }}>
          <div style={{ padding: "0.35rem", borderRadius: "8px", background: "rgba(0, 242, 254, 0.15)", color: "var(--cyber-cyan)" }}>
            <GlobeLock size={20} />
          </div>
          <h1 className="font-display" style={{ fontSize: "1.65rem", fontWeight: 800 }}>
            THREAT INTELLIGENCE & REPUTATION EXCHANGE
          </h1>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
          Query known Indicators of Compromise (IOCs) across global blacklists, URLhaus, AbuseIPDB, and CyberShield fraud networks.
        </p>
      </div>

      {/* IOC Lookup Search Bar */}
      <div className="cyber-card">
        <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          Indicator of Compromise (IOC) Lookup
        </h3>
        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
          Inspect any domain, IP address, URL, phone number, or UPI VPA against verified threat repositories.
        </p>

        <form onSubmit={handleSearch} style={{ display: "flex", gap: "0.75rem" }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="e.g. sbi-kyc-verification.online, 192.241.220.12, refund.desk.sbi@ybl"
            className="cyber-input font-mono"
            style={{ fontSize: "0.9rem" }}
          />
          <button type="submit" disabled={searching} className="cyber-btn cyber-btn-primary" style={{ padding: "0 1.5rem" }}>
            <Search size={16} />
            <span>{searching ? "Querying Feeds..." : "Lookup IOC"}</span>
          </button>
        </form>

        {searchResult && (
          <div
            style={{
              marginTop: "1.25rem",
              background: "rgba(11, 15, 25, 0.8)",
              border: `1px solid ${searchResult.is_flagged ? "rgba(239, 68, 68, 0.4)" : "rgba(16, 185, 129, 0.4)"}`,
              borderRadius: "8px",
              padding: "1rem 1.25rem"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <ThreatBadge level={searchResult.is_flagged ? "CRITICAL" : "SAFE"} />
                <span className="font-mono" style={{ fontSize: "0.9rem", fontWeight: 700 }}>
                  {searchResult.indicator}
                </span>
              </div>
              <span className="font-mono" style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Source: {searchResult.source}
              </span>
            </div>

            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.4rem" }}>
              <strong>Status: </strong>
              <span style={{ color: searchResult.is_flagged ? "#f87171" : "#34d399", fontWeight: 600 }}>
                {searchResult.threat_label}
              </span>
              {searchResult.is_flagged && ` (Confidence: ${searchResult.confidence}%)`}
            </div>
          </div>
        )}
      </div>

      {/* Global Threat Feed Table */}
      <div className="cyber-card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Active Global Threat Intelligence Feed</h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              High-confidence indicators flagged across banking phishing, botnet IPs, and reported fraud accounts.
            </p>
          </div>
          <button onClick={fetchFeed} className="cyber-btn cyber-btn-secondary" style={{ padding: "0.4rem 0.75rem", fontSize: "0.75rem" }}>
            <RefreshCw size={13} /> Refresh Feed
          </button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", color: "var(--text-muted)", fontSize: "0.75rem", textTransform: "uppercase" }}>
                <th style={{ padding: "0.75rem 1rem" }}>Indicator (IOC)</th>
                <th style={{ padding: "0.75rem 1rem" }}>Vector Type</th>
                <th style={{ padding: "0.75rem 1rem" }}>Threat Classification</th>
                <th style={{ padding: "0.75rem 1rem" }}>Confidence</th>
                <th style={{ padding: "0.75rem 1rem" }}>Intelligence Source</th>
                <th style={{ padding: "0.75rem 1rem" }}>Severity</th>
              </tr>
            </thead>
            <tbody>
              {feed.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                  <td className="font-mono" style={{ padding: "0.75rem 1rem", color: "var(--text-main)", fontWeight: 600 }}>
                    {item.indicator}
                  </td>
                  <td style={{ padding: "0.75rem 1rem", color: "var(--text-secondary)" }}>
                    {item.type}
                  </td>
                  <td style={{ padding: "0.75rem 1rem", color: "#fca5a5", fontWeight: 600 }}>
                    {item.threat}
                  </td>
                  <td className="font-mono" style={{ padding: "0.75rem 1rem", color: "var(--text-main)" }}>
                    {item.confidence}
                  </td>
                  <td style={{ padding: "0.75rem 1rem", color: "var(--text-muted)" }}>
                    {item.source}
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <ThreatBadge level={item.severity} />
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
