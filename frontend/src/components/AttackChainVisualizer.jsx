import React from "react";
import { ArrowDown, Shield, AlertOctagon, CheckCircle2 } from "lucide-react";

export default function AttackChainVisualizer({ chain = [] }) {
  if (!chain || chain.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
        No attack chain generated for this event.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {chain.map((step, idx) => {
        const isLast = idx === chain.length - 1;
        const isKillPoint = step.kill_chain_point;

        return (
          <React.Fragment key={idx}>
            <div
              className={`chain-node ${isKillPoint ? "kill-chain" : isLast ? "impact" : ""}`}
              style={{
                borderLeft: `4px solid ${isKillPoint ? "var(--cyber-cyan)" : isLast ? "var(--threat-critical)" : "var(--cyber-blue)"}`,
                background: "rgba(16, 22, 38, 0.85)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <span
                    className="font-mono"
                    style={{
                      background: isKillPoint ? "rgba(0, 242, 254, 0.2)" : "rgba(255, 255, 255, 0.08)",
                      color: isKillPoint ? "var(--cyber-cyan)" : "var(--text-main)",
                      padding: "0.2rem 0.5rem",
                      borderRadius: "4px",
                      fontSize: "0.75rem",
                      fontWeight: 700
                    }}
                  >
                    STAGE 0{step.step || idx + 1}
                  </span>
                  <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
                    {step.stage}
                  </span>
                </div>

                {isKillPoint && (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      color: "var(--cyber-cyan)",
                      background: "rgba(0, 242, 254, 0.1)",
                      padding: "0.2rem 0.5rem",
                      borderRadius: "9999px",
                      border: "1px solid rgba(0, 242, 254, 0.3)"
                    }}
                  >
                    <Shield size={12} /> PREVENTION KILL-CHAIN POINT
                  </span>
                )}
                {isLast && !isKillPoint && (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      color: "var(--threat-critical)",
                      background: "rgba(239, 68, 68, 0.15)",
                      padding: "0.2rem 0.5rem",
                      borderRadius: "9999px",
                      border: "1px solid rgba(239, 68, 68, 0.4)"
                    }}
                  >
                    <AlertOctagon size={12} /> TARGET IMPACT
                  </span>
                )}
              </div>

              <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.35rem" }}>
                {step.title}
              </h4>
              <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "0.75rem", lineHeight: 1.5 }}>
                {step.description}
              </p>

              {step.indicators && step.indicators.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "0.6rem" }}>
                  {step.indicators.map((ind, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: "0.7rem",
                        color: "var(--text-muted)",
                        background: "rgba(255, 255, 255, 0.04)",
                        border: "1px solid var(--border-subtle)",
                        padding: "0.15rem 0.45rem",
                        borderRadius: "4px"
                      }}
                    >
                      ⚠ {ind}
                    </span>
                  ))}
                </div>
              )}

              {step.prevention_action && (
                <div
                  style={{
                    background: "rgba(0, 242, 254, 0.05)",
                    border: "1px solid rgba(0, 242, 254, 0.2)",
                    borderRadius: "6px",
                    padding: "0.6rem 0.75rem",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.5rem",
                    fontSize: "0.825rem",
                    color: "var(--text-main)"
                  }}
                >
                  <CheckCircle2 size={16} color="var(--cyber-cyan)" style={{ flexShrink: 0, marginTop: "2px" }} />
                  <div>
                    <strong style={{ color: "var(--cyber-cyan)" }}>Defensive Action: </strong>
                    {step.prevention_action}
                  </div>
                </div>
              )}
            </div>

            {!isLast && (
              <div className="chain-connector">
                <ArrowDown size={18} />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
