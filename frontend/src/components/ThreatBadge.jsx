import React from "react";
import { ShieldAlert, AlertTriangle, AlertCircle, ShieldCheck, Info } from "lucide-react";

export default function ThreatBadge({ level = "SAFE", size = "normal" }) {
  const normLevel = (level || "SAFE").toUpperCase();

  const config = {
    CRITICAL: {
      className: "threat-badge-critical",
      icon: ShieldAlert,
      label: "CRITICAL THREAT"
    },
    HIGH: {
      className: "threat-badge-high",
      icon: AlertTriangle,
      label: "HIGH RISK"
    },
    MEDIUM: {
      className: "threat-badge-medium",
      icon: AlertCircle,
      label: "MEDIUM RISK"
    },
    LOW: {
      className: "threat-badge-low",
      icon: Info,
      label: "LOW RISK"
    },
    SAFE: {
      className: "threat-badge-safe",
      icon: ShieldCheck,
      label: "VERIFIED SAFE"
    }
  };

  const item = config[normLevel] || config.MEDIUM;
  const Icon = item.icon;

  return (
    <span className={`threat-badge ${item.className}`} style={{ fontSize: size === "large" ? "0.85rem" : "0.725rem" }}>
      <Icon size={size === "large" ? 16 : 13} />
      <span>{item.label}</span>
    </span>
  );
}
