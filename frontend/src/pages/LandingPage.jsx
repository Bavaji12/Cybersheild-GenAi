import React from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  Zap,
  Lock,
  Landmark,
  Cpu,
  Bot,
  GitFork,
  ArrowRight,
  CheckCircle,
  FileText,
  AlertTriangle,
  QrCode
} from "lucide-react";

export default function LandingPage() {
  const differentiators = [
    {
      title: "Financial + Technology Defense",
      desc: "Combines high-stakes UPI, banking, and crypto fraud detection with advanced URL, phishing, and malware prevention.",
      icon: Landmark,
      color: "var(--cyber-cyan)"
    },
    {
      title: "CyberShield GenAI Copilot",
      desc: "Converts complex technical findings and threat intelligence into prioritized recovery checklists and plain-language guidance.",
      icon: Bot,
      color: "var(--cyber-blue)"
    },
    {
      title: "Deterministic AI Risk Scoring",
      desc: "Weighted composite 0–100 scoring based on URL reputation, message semantics, threat feeds, and financial fraud indicators.",
      icon: Zap,
      color: "#f59e0b"
    },
    {
      title: "MITRE Attack Chain Analysis",
      desc: "Visually maps how a single phishing SMS can cascade into credential theft, OTP bypass, and catastrophic account takeover.",
      icon: GitFork,
      color: "#ec4899"
    },
    {
      title: "Multi-Input Threat Vectors",
      desc: "Inspect URLs, emails, SMS, UPI payment links, QR codes, screenshots with OCR, and files without executing malicious payloads.",
      icon: QrCode,
      color: "#8b5cf6"
    },
    {
      title: "Forensic PDF & JSON Reports",
      desc: "Instantly export comprehensive forensic incident dossiers for law enforcement, insurance, and compliance audits.",
      icon: FileText,
      color: "#10b981"
    }
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      {/* Top Hero Navigation */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1.25rem 3rem",
          borderBottom: "1px solid var(--border-subtle)",
          background: "rgba(6, 8, 14, 0.8)",
          backdropFilter: "blur(12px)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #00f2fe 0%, #0ea5e9 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Shield size={20} color="#050b14" />
          </div>
          <span className="font-display" style={{ fontSize: "1.1rem", fontWeight: 800 }}>
            CYBERSHIELD <span style={{ color: "var(--cyber-cyan)" }}>GENAI</span>
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link to="/dashboard" className="cyber-btn cyber-btn-secondary" style={{ fontSize: "0.85rem" }}>
            Explore Command Center
          </Link>
          <Link to="/analyzer" className="cyber-btn cyber-btn-primary" style={{ fontSize: "0.85rem" }}>
            Launch Threat Scanner <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ padding: "5rem 2rem 4rem", textAlign: "center", maxWidth: "1100px", margin: "0 auto" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "rgba(0, 242, 254, 0.08)",
            border: "1px solid var(--border-cyber)",
            padding: "0.4rem 1rem",
            borderRadius: "9999px",
            color: "var(--cyber-cyan)",
            fontSize: "0.8rem",
            fontWeight: 700,
            marginBottom: "1.5rem"
          }}
        >
          <Zap size={14} />
          <span>CYBER DEFENSE MEETS GENERATIVE AI RISK REASONING</span>
        </div>

        <h1
          className="font-display"
          style={{
            fontSize: "3.2rem",
            fontWeight: 900,
            lineHeight: 1.15,
            marginBottom: "1.5rem",
            background: "linear-gradient(180deg, #ffffff 40%, #94a3b8 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}
        >
          UNIFIED FINANCIAL & TECHNOLOGY CYBERSECURITY
        </h1>

        <p
          style={{
            fontSize: "1.15rem",
            color: "var(--text-secondary)",
            maxWidth: "760px",
            margin: "0 auto 2.5rem",
            lineHeight: 1.6
          }}
        >
          Stop sophisticated bank impersonation, UPI collect scams, crypto drainers, and credential phishing before they compromise your assets.
        </p>

        {/* Core Philosophy Badge */}
        <div
          style={{
            display: "inline-flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "0.75rem",
            padding: "0.85rem 1.5rem",
            background: "rgba(16, 22, 38, 0.75)",
            border: "1px solid var(--border-cyber)",
            borderRadius: "12px",
            marginBottom: "3rem",
            fontFamily: "var(--font-mono)",
            fontSize: "0.8rem"
          }}
        >
          <span style={{ color: "var(--cyber-cyan)" }}>DETECT</span>
          <span style={{ color: "var(--text-muted)" }}>→</span>
          <span style={{ color: "var(--cyber-blue)" }}>ANALYZE</span>
          <span style={{ color: "var(--text-muted)" }}>→</span>
          <span style={{ color: "#a855f7" }}>EXPLAIN</span>
          <span style={{ color: "var(--text-muted)" }}>→</span>
          <span style={{ color: "#facc15" }}>ASSESS RISK</span>
          <span style={{ color: "var(--text-muted)" }}>→</span>
          <span style={{ color: "#34d399" }}>PREVENT</span>
          <span style={{ color: "var(--text-muted)" }}>→</span>
          <span style={{ color: "#38bdf8" }}>RESPOND</span>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
          <Link to="/analyzer" className="cyber-btn cyber-btn-primary" style={{ padding: "0.85rem 1.75rem", fontSize: "1rem" }}>
            Test Suspicious URL / Message <ArrowRight size={18} />
          </Link>
          <Link to="/dashboard" className="cyber-btn cyber-btn-secondary" style={{ padding: "0.85rem 1.75rem", fontSize: "1rem" }}>
            Live Security Dashboard
          </Link>
        </div>
      </section>

      {/* Differentiators Grid */}
      <section style={{ padding: "3rem 2rem 5rem", maxWidth: "1280px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.5rem" }}>
            Architected for Modern Cyber Warfare
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Going beyond traditional virus scanners with contextual intelligence and multi-modal risk scoring.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
          {differentiators.map((diff, i) => {
            const Icon = diff.icon;
            return (
              <div key={i} className="cyber-card" style={{ padding: "1.75rem" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "10px",
                    background: "rgba(255, 255, 255, 0.04)",
                    border: `1px solid ${diff.color}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "1.25rem",
                    boxShadow: `0 0 15px ${diff.color}33`
                  }}
                >
                  <Icon size={22} color={diff.color} />
                </div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                  {diff.title}
                </h3>
                <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  {diff.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--border-subtle)",
          padding: "2rem 3rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "var(--text-muted)",
          fontSize: "0.825rem"
        }}
      >
        <div>
          CyberShield – GenAI Platform © 2026. Built for Defensive Cybersecurity & Financial Protection.
        </div>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          <Link to="/awareness" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Awareness Academy</Link>
          <Link to="/threat-intelligence" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Threat Intel</Link>
          <Link to="/admin" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Admin Command</Link>
        </div>
      </footer>
    </div>
  );
}
