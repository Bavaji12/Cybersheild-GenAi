import React from "react";

export default function RiskGauge({ score = 0, size = 160, label = "CYBER RISK SCORE" }) {
  const clamped = Math.min(100, Math.max(0, Number(score) || 0));
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Use 240 degree arc instead of full 360 for an instrument gauge look
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (clamped / 100) * arcLength;

  let color = "#10b981"; // Safe
  let glow = "rgba(16, 185, 129, 0.4)";
  let statusText = "SAFE";

  if (clamped >= 81) {
    color = "#ef4444";
    glow = "rgba(239, 68, 68, 0.5)";
    statusText = "CRITICAL";
  } else if (clamped >= 61) {
    color = "#f97316";
    glow = "rgba(249, 115, 22, 0.5)";
    statusText = "HIGH RISK";
  } else if (clamped >= 41) {
    color = "#eab308";
    glow = "rgba(234, 179, 8, 0.4)";
    statusText = "MODERATE";
  } else if (clamped >= 21) {
    color = "#38bdf8";
    glow = "rgba(56, 189, 248, 0.4)";
    statusText = "LOW RISK";
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(135deg)" }}>
        {/* Background Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
        />
        {/* Value Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transition: "stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.4s ease",
            filter: `drop-shadow(0 0 8px ${glow})`
          }}
        />
      </svg>

      {/* Center Score & Text */}
      <div
        style={{
          position: "absolute",
          top: "45%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center"
        }}
      >
        <div
          className="font-display"
          style={{
            fontSize: size * 0.22,
            fontWeight: 800,
            color: color,
            lineHeight: 1
          }}
        >
          {Math.round(clamped)}
        </div>
        <div
          style={{
            fontSize: "0.7rem",
            color: "var(--text-muted)",
            fontWeight: 600,
            marginTop: "0.25rem",
            letterSpacing: "0.08em"
          }}
        >
          / 100
        </div>
        <div
          style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            color: color,
            marginTop: "0.25rem",
            letterSpacing: "0.05em"
          }}
        >
          {statusText}
        </div>
      </div>

      <div
        style={{
          marginTop: "-0.5rem",
          fontSize: "0.75rem",
          fontWeight: 700,
          color: "var(--text-secondary)",
          letterSpacing: "0.06em",
          textTransform: "uppercase"
        }}
      >
        {label}
      </div>
    </div>
  );
}
