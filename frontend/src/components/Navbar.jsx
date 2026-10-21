import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Sparkles, Activity, Search, User, KeyRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, demoLogin } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="top-header">
      {/* Left: Engine Health Status */}
      <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
        <div className="status-pill">
          <div className="pulse-dot"></div>
          <span>CYBERSHIELD ENGINE ONLINE</span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.75rem",
            color: "var(--text-muted)",
            background: "rgba(255, 255, 255, 0.03)",
            padding: "0.25rem 0.75rem",
            borderRadius: "6px",
            border: "1px solid var(--border-subtle)"
          }}
        >
          <Activity size={13} color="var(--cyber-cyan)" />
          <span>Active Heuristic & GenAI Rule Defenses</span>
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <button
          onClick={() => navigate("/analyzer")}
          className="cyber-btn cyber-btn-primary"
          style={{ padding: "0.45rem 0.95rem", fontSize: "0.8rem" }}
        >
          <Search size={14} />
          <span>Quick Threat Scan</span>
        </button>

        <button
          onClick={() => navigate("/security-copilot")}
          className="cyber-btn cyber-btn-secondary"
          style={{ padding: "0.45rem 0.95rem", fontSize: "0.8rem", color: "var(--cyber-cyan)" }}
        >
          <Sparkles size={14} />
          <span>Ask Copilot</span>
        </button>

        {user ? (
          <Link
            to="/settings"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              textDecoration: "none",
              color: "var(--text-main)",
              background: "rgba(255, 255, 255, 0.05)",
              padding: "0.35rem 0.75rem",
              borderRadius: "8px",
              border: "1px solid var(--border-subtle)",
              fontSize: "0.8rem",
              fontWeight: 600
            }}
          >
            <User size={14} color="var(--cyber-cyan)" />
            <span>{user.username}</span>
          </Link>
        ) : (
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={() => demoLogin("user")}
              className="cyber-btn cyber-btn-secondary"
              style={{ fontSize: "0.75rem", padding: "0.4rem 0.7rem" }}
            >
              Demo User
            </button>
            <button
              onClick={() => demoLogin("admin")}
              className="cyber-btn cyber-btn-secondary"
              style={{ fontSize: "0.75rem", padding: "0.4rem 0.7rem", color: "#facc15" }}
            >
              Demo Admin
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
