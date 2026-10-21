import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Clock,
  PhoneCall,
  FileCheck,
  ArrowRight,
  Plus
} from "lucide-react";
import ThreatBadge from "../components/ThreatBadge";
import { api } from "../services/api";

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState("");
  const [incidentType, setIncidentType] = useState("clicked_link");
  const [description, setDescription] = useState("");
  const [clickedLink, setClickedLink] = useState(true);
  const [enteredCredentials, setEnteredCredentials] = useState(false);
  const [sharedOtp, setSharedOtp] = useState(false);
  const [sentPayment, setSentPayment] = useState(false);
  const [installedApp, setInstalledApp] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const res = await api.incidents.list();
      setIncidents(res || []);
    } catch (err) {
      console.error("Failed to load incidents", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleToggleAction = async (actionId) => {
    try {
      await api.incidents.toggleAction(actionId);
      fetchIncidents();
    } catch (err) {
      console.error("Failed to toggle action", err);
    }
  };

  const handleCreateIncident = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setSubmitting(true);
    try {
      await api.incidents.report({
        title,
        incident_type: incidentType,
        description,
        clicked_link: clickedLink,
        entered_credentials: enteredCredentials,
        shared_otp: sharedOtp,
        sent_payment: sentPayment,
        installed_app: installedApp,
        connected_wallet: connectedWallet
      });

      setShowModal(false);
      setTitle("");
      setDescription("");
      setEnteredCredentials(false);
      setSharedOtp(false);
      setSentPayment(false);
      fetchIncidents();
    } catch (err) {
      console.error("Report incident failed", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Title */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.25rem" }}>
            <div style={{ padding: "0.35rem", borderRadius: "8px", background: "rgba(239, 68, 68, 0.15)", color: "#ef4444" }}>
              <AlertTriangle size={20} />
            </div>
            <h1 className="font-display" style={{ fontSize: "1.65rem", fontWeight: 800 }}>
              INCIDENT RESPONSE & CONTAINMENT
            </h1>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            Emergency incident triage. CyberShield diagnoses the severity of potential exposure and synthesizes an actionable, prioritized mitigation checklist.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="cyber-btn cyber-btn-primary"
          style={{ padding: "0.5rem 1rem" }}
        >
          <Plus size={16} /> Report New Incident
        </button>
      </div>

      {/* Official Reporting Hotlines Banner */}
      <div
        className="cyber-card"
        style={{
          background: "linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(249, 115, 22, 0.08))",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1rem 1.5rem"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ padding: "0.5rem", borderRadius: "50%", background: "rgba(239, 68, 68, 0.2)", color: "#ef4444" }}>
            <PhoneCall size={20} />
          </div>
          <div>
            <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-main)" }}>
              Emergency Fraud Hotline & Evidence Preservation
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              In India: Dial <strong>1930</strong> (National Cyber Crime Reporting Portal) | Official Portal: <strong>cybercrime.gov.in</strong>
            </div>
          </div>
        </div>

        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          CyberShield does not pretend to contact banks; prioritize official hotlines.
        </span>
      </div>

      {/* Incidents List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {incidents.length > 0 ? (
          incidents.map((inc) => (
            <div key={inc.id} className="cyber-card" style={{ borderLeft: `6px solid ${inc.severity === "CRITICAL" ? "var(--threat-critical)" : inc.severity === "HIGH" ? "var(--threat-high)" : "var(--cyber-blue)"}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <ThreatBadge level={inc.severity} />
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>{inc.title}</h3>
                </div>

                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    padding: "0.25rem 0.65rem",
                    borderRadius: "4px",
                    background: inc.status === "RESOLVED" ? "rgba(16, 185, 129, 0.15)" : "rgba(249, 115, 22, 0.15)",
                    color: inc.status === "RESOLVED" ? "#34d399" : "#fb923c"
                  }}
                >
                  {inc.status}
                </span>
              </div>

              <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "1rem", lineHeight: 1.5 }}>
                {inc.description}
              </p>

              {/* Action Checklist */}
              <div>
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                  Containment Checklist & Response Steps:
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  {inc.actions && inc.actions.map((act) => (
                    <div
                      key={act.id}
                      onClick={() => handleToggleAction(act.id)}
                      style={{
                        background: act.is_completed ? "rgba(16, 185, 129, 0.08)" : "rgba(11, 15, 25, 0.7)",
                        border: `1px solid ${act.is_completed ? "rgba(16, 185, 129, 0.3)" : "var(--border-subtle)"}`,
                        padding: "0.6rem 0.85rem",
                        borderRadius: "6px",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.6rem",
                        cursor: "pointer",
                        transition: "all var(--transition-fast)"
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={act.is_completed}
                        onChange={() => {}}
                        style={{ marginTop: "3px", cursor: "pointer" }}
                      />
                      <div style={{ flex: 1 }}>
                        <span
                          style={{
                            fontSize: "0.825rem",
                            color: act.is_completed ? "var(--text-muted)" : "var(--text-main)",
                            textDecoration: act.is_completed ? "line-through" : "none"
                          }}
                        >
                          {act.action_text}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          padding: "0.15rem 0.45rem",
                          borderRadius: "4px",
                          background: act.action_priority === "IMMEDIATE" ? "rgba(239, 68, 68, 0.2)" : "rgba(255, 255, 255, 0.05)",
                          color: act.action_priority === "IMMEDIATE" ? "#fca5a5" : "var(--text-muted)"
                        }}
                      >
                        {act.action_priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="cyber-card" style={{ textAlign: "center", padding: "3rem" }}>
            <ShieldCheck size={36} color="var(--threat-safe)" style={{ margin: "0 auto 1rem" }} />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>No Active Cyber Incidents</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
              If you clicked a suspicious link or shared payment details, click "Report New Incident" to generate an emergency containment plan.
            </p>
          </div>
        )}
      </div>

      {/* Modal for Reporting */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "1rem"
          }}
        >
          <div className="cyber-card" style={{ maxWidth: "600px", width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "0.5rem" }}>
              Report Potential Cyber Incident
            </h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "1.25rem" }}>
              Answer the diagnostic questionnaire so CyberShield can generate your prioritized recovery plan.
            </p>

            <form onSubmit={handleCreateIncident} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>
                  Incident Summary
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Clicked fake bank link and entered customer ID"
                  required
                  className="cyber-input"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>
                  Description / Context
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what occurred, what SMS was received, and what actions were taken..."
                  required
                  rows={3}
                  className="cyber-input"
                />
              </div>

              {/* Diagnostic Checklist */}
              <div style={{ background: "rgba(0,0,0,0.3)", padding: "0.85rem", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--cyber-cyan)", marginBottom: "0.5rem" }}>
                  Diagnostic Exposure Checklist:
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.825rem", cursor: "pointer" }}>
                    <input type="checkbox" checked={clickedLink} onChange={(e) => setClickedLink(e.target.checked)} />
                    <span>I clicked an unverified URL or link</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.825rem", cursor: "pointer" }}>
                    <input type="checkbox" checked={enteredCredentials} onChange={(e) => setEnteredCredentials(e.target.checked)} />
                    <span>I entered a password, username, or debit card PIN</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.825rem", cursor: "pointer" }}>
                    <input type="checkbox" checked={sharedOtp} onChange={(e) => setSharedOtp(e.target.checked)} />
                    <span>I shared an SMS OTP or verification code</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.825rem", cursor: "pointer" }}>
                    <input type="checkbox" checked={sentPayment} onChange={(e) => setSentPayment(e.target.checked)} />
                    <span>A financial payment or UPI transfer was made</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.825rem", cursor: "pointer" }}>
                    <input type="checkbox" checked={installedApp} onChange={(e) => setInstalledApp(e.target.checked)} />
                    <span>An unverified app or remote assistance tool (AnyDesk) was installed</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.825rem", cursor: "pointer" }}>
                    <input type="checkbox" checked={connectedWallet} onChange={(e) => setConnectedWallet(e.target.checked)} />
                    <span>A cryptocurrency wallet was connected or seed phrase entered</span>
                  </label>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button type="button" onClick={() => setShowModal(false)} className="cyber-btn cyber-btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="cyber-btn cyber-btn-danger">
                  {submitting ? "Synthesizing Plan..." : "Generate Recovery Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
