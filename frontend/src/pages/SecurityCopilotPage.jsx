import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Bot, Send, Sparkles, User, ShieldAlert, CheckCircle2, RefreshCw } from "lucide-react";
import { api } from "../services/api";

export default function SecurityCopilotPage() {
  const [searchParams] = useSearchParams();
  const scanId = searchParams.get("scanId");
  const [messages, setMessages] = useState([
    {
      sender: "copilot",
      text: "Hello! I am your CyberShield Security Copilot. I analyze structured findings, explain cyber and financial threats in plain English, and provide prioritized defensive checklists.\n\nHow can I assist your security today?",
      suggested_actions: [
        "Ask about a suspicious email or SMS you received",
        "Ask what to do if you entered net-banking credentials",
        "Ask how UPI collect scams steal money"
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (scanId) {
      loadScanExplanation(scanId);
    }
  }, [scanId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadScanExplanation = async (id) => {
    setLoading(true);
    try {
      const res = await api.copilot.explainScan(id);
      setMessages((prev) => [
        ...prev,
        {
          sender: "user",
          text: `Explain forensic scan results for Incident ID: CS-${id}`
        },
        {
          sender: "copilot",
          text: res.reply,
          suggested_actions: res.suggested_actions || []
        }
      ]);
    } catch (err) {
      console.error("Scan explanation failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputMessage;
    if (!query.trim()) return;

    const newMessages = [...messages, { sender: "user", text: query }];
    setMessages(newMessages);
    setInputMessage("");
    setLoading(true);

    try {
      const res = await api.copilot.chat({
        message: query
      });

      setMessages([
        ...newMessages,
        {
          sender: "copilot",
          text: res.reply,
          suggested_actions: res.suggested_actions || []
        }
      ]);
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          sender: "copilot",
          text: "⚠ Unable to communicate with the Copilot reasoning engine. Please ensure the backend server is running."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    "I clicked a fake bank link, what immediate steps should I take?",
    "Can a scammer withdraw money if I only scan a QR code?",
    "How can I detect if an audio call is an AI deepfake voice clone?",
    "What is the difference between a Phishing link and standard URL?"
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", height: "calc(100vh - 120px)" }}>
      {/* Title */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div style={{ padding: "0.35rem", borderRadius: "8px", background: "rgba(0, 242, 254, 0.15)", color: "var(--cyber-cyan)" }}>
            <Bot size={20} />
          </div>
          <h1 className="font-display" style={{ fontSize: "1.5rem", fontWeight: 800 }}>
            CYBERSHIELD SECURITY COPILOT
          </h1>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.825rem" }}>
          Specialized defensive GenAI cybersecurity assistant. Analyzes structured findings, guides incident recovery, and educates on threats.
        </p>
      </div>

      {/* Chat Container */}
      <div
        className="cyber-card"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "1rem",
          minHeight: 0
        }}
      >
        {/* Messages Stream */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            paddingRight: "0.5rem"
          }}
        >
          {messages.map((msg, idx) => {
            const isUser = msg.sender === "user";
            return (
              <div
                key={idx}
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  alignSelf: isUser ? "flex-end" : "flex-start",
                  maxWidth: isUser ? "75%" : "85%"
                }}
              >
                {!isUser && (
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      background: "rgba(0, 242, 254, 0.15)",
                      border: "1px solid var(--border-cyber)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0
                    }}
                  >
                    <Bot size={16} color="var(--cyber-cyan)" />
                  </div>
                )}

                <div
                  style={{
                    background: isUser ? "linear-gradient(135deg, rgba(0, 242, 254, 0.2), rgba(14, 165, 233, 0.25))" : "rgba(11, 15, 25, 0.8)",
                    border: `1px solid ${isUser ? "rgba(0, 242, 254, 0.4)" : "var(--border-subtle)"}`,
                    borderRadius: "10px",
                    padding: "0.85rem 1.15rem",
                    color: "var(--text-main)",
                    fontSize: "0.875rem",
                    lineHeight: 1.6,
                    whiteSpace: "pre-line"
                  }}
                >
                  {msg.text}

                  {msg.suggested_actions && msg.suggested_actions.length > 0 && (
                    <div style={{ marginTop: "0.75rem", paddingTop: "0.6rem", borderTop: "1px solid var(--border-subtle)" }}>
                      <div style={{ fontSize: "0.75rem", color: "var(--cyber-cyan)", fontWeight: 700, marginBottom: "0.35rem" }}>
                        Suggested Next Inquiries:
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                        {msg.suggested_actions.map((act, i) => (
                          <button
                            key={i}
                            onClick={() => handleSendMessage(act)}
                            className="cyber-btn cyber-btn-secondary"
                            style={{ fontSize: "0.75rem", padding: "0.25rem 0.6rem" }}
                          >
                            {act}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      background: "var(--bg-surface-elevated)",
                      border: "1px solid var(--border-subtle)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0
                    }}
                  >
                    <User size={16} color="var(--text-secondary)" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div style={{ display: "flex", gap: "0.75rem", alignSelf: "flex-start" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "rgba(0, 242, 254, 0.15)",
                  border: "1px solid var(--border-cyber)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Bot size={16} color="var(--cyber-cyan)" />
              </div>
              <div
                style={{
                  background: "rgba(11, 15, 25, 0.8)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "10px",
                  padding: "0.85rem 1.15rem",
                  fontSize: "0.85rem",
                  color: "var(--cyber-cyan)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}
              >
                <Sparkles className="pulse-dot" size={14} />
                <span>CyberShield Copilot analyzing threat patterns...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Question Pills */}
        <div style={{ display: "flex", gap: "0.4rem", overflowX: "auto", padding: "0.5rem 0", borderTop: "1px solid var(--border-subtle)" }}>
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="cyber-btn cyber-btn-secondary"
              style={{ fontSize: "0.725rem", padding: "0.3rem 0.6rem", whiteSpace: "nowrap" }}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask Copilot about any security threat, suspicious link, or recovery step..."
            className="cyber-input"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className="cyber-btn cyber-btn-primary"
            style={{ padding: "0 1.25rem" }}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
