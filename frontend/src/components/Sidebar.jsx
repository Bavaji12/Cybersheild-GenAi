import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Shield,
  LayoutDashboard,
  ScanSearch,
  Landmark,
  Cpu,
  GitFork,
  Bot,
  AlertTriangle,
  UserCheck,
  GlobeLock,
  FileText,
  GraduationCap,
  ShieldCheck,
  Settings,
  LogOut
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const path = location.pathname;

  const navItems = [
    { section: "CORE COMMAND" },
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/analyzer", label: "Multi-Input Analyzer", icon: ScanSearch },
    
    { section: "SECURITY ENGINES" },
    { path: "/financial-security", label: "Financial Security", icon: Landmark },
    { path: "/technology-security", label: "Technology Security", icon: Cpu },
    { path: "/attack-chain", label: "Attack Chain Engine", icon: GitFork },
    { path: "/security-copilot", label: "GenAI Copilot", icon: Bot },

    { section: "RESPONSE & INTEL" },
    { path: "/incidents", label: "Incident Response", icon: AlertTriangle },
    { path: "/threat-intelligence", label: "Threat Intelligence", icon: GlobeLock },
    { path: "/risk-profile", label: "Personal Risk Profile", icon: UserCheck },
    { path: "/reports", label: "Forensic Reports", icon: FileText },
    { path: "/awareness", label: "Awareness Center", icon: GraduationCap },

    { section: "SYSTEM" },
    { path: "/admin", label: "Admin Dashboard", icon: ShieldCheck },
    { path: "/settings", label: "Security Settings", icon: Settings }
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <Link to="/" style={{ textDecoration: "none" }} className="sidebar-logo">
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #00f2fe 0%, #0ea5e9 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 15px rgba(0, 242, 254, 0.4)"
          }}
        >
          <Shield size={22} color="#050b14" />
        </div>
        <div>
          <div className="font-display" style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--text-main)", letterSpacing: "0.06em" }}>
            CYBERSHIELD
          </div>
          <div style={{ fontSize: "0.65rem", color: "var(--cyber-cyan)", fontWeight: 700, letterSpacing: "0.15em" }}>
            GENAI ENGINE
          </div>
        </div>
      </Link>

      {/* Nav List */}
      <nav className="sidebar-nav">
        {navItems.map((item, idx) => {
          if (item.section) {
            return (
              <div key={idx} className="nav-section-title">
                {item.section}
              </div>
            );
          }
          const Icon = item.icon;
          const isActive = path === item.path;

          return (
            <Link
              key={idx}
              to={item.path}
              className={`nav-link ${isActive ? "active" : ""}`}
            >
              <Icon size={18} color={isActive ? "var(--cyber-cyan)" : "currentColor"} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div
        style={{
          padding: "1rem 1.25rem",
          borderTop: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(6, 8, 14, 0.5)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", minWidth: 0 }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "var(--bg-surface-elevated)",
              border: "1px solid var(--border-cyber)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "0.8rem",
              color: "var(--cyber-cyan)"
            }}
          >
            {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
          </div>
          <div style={{ minWidth: 0, overflow: "hidden" }}>
            <div style={{ fontSize: "0.825rem", fontWeight: 600, color: "var(--text-main)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user?.full_name || user?.username || "Guest User"}
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "capitalize" }}>
              {user?.role || "Visitor"}
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          title="Sign Out"
          style={{
            background: "transparent",
            border: "none",
            color: "var(--text-muted)",
            cursor: "pointer",
            padding: "0.4rem",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--threat-critical)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
