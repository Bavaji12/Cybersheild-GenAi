import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  ArrowRight,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { api } from "../services/api";

export default function AwarenessPage() {
  const [modules, setModules] = useState([]);
  const [activeCategory, setActiveCategory] = useState("phishing");
  const [quizData, setQuizData] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const mods = await api.awareness.getModules();
        setModules(mods || []);
        loadQuiz(activeCategory);
      } catch (err) {
        console.error("Failed to load awareness", err);
      }
    }
    loadData();
  }, []);

  const loadQuiz = async (cat) => {
    setActiveCategory(cat);
    setQuizResult(null);
    setSelectedAnswers({});
    try {
      const res = await api.awareness.getQuiz(cat);
      setQuizData(res);
    } catch (err) {
      console.error("Failed to load quiz", err);
    }
  };

  const handleSelectOption = (questionId, optionKey) => {
    if (quizResult) return; // locked after submission
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionKey }));
  };

  const handleSubmitQuiz = async () => {
    setSubmitting(true);
    try {
      const res = await api.awareness.submitQuiz({
        category: activeCategory,
        answers: selectedAnswers
      });
      setQuizResult(res);
    } catch (err) {
      console.error("Quiz submission failed", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.25rem" }}>
          <div style={{ padding: "0.35rem", borderRadius: "8px", background: "rgba(168, 85, 247, 0.15)", color: "#a855f7" }}>
            <GraduationCap size={20} />
          </div>
          <h1 className="font-display" style={{ fontSize: "1.65rem", fontWeight: 800 }}>
            SECURITY AWARENESS & AI SCAM ACADEMY
          </h1>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
          Interactive micro-learning modules and defensive scenario quizzes covering Phishing, UPI fraud, crypto drainers, and generative AI voice-cloning scams.
        </p>
      </div>

      {/* Educational Modules Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
        {modules.map((m) => {
          const isSelected = activeCategory === m.id;
          return (
            <div
              key={m.id}
              onClick={() => loadQuiz(m.id)}
              className="cyber-card"
              style={{
                cursor: "pointer",
                borderColor: isSelected ? "var(--cyber-cyan)" : "var(--border-subtle)",
                background: isSelected ? "rgba(0, 242, 254, 0.08)" : "var(--bg-glass-card)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--cyber-cyan)", background: "rgba(0,242,254,0.1)", padding: "0.2rem 0.5rem", borderRadius: "4px" }}>
                  {m.level}
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{m.duration}</span>
              </div>

              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "0.5rem" }}>{m.title}</h3>
              <p style={{ fontSize: "0.825rem", color: "var(--text-secondary)", marginBottom: "0.85rem", lineHeight: 1.45 }}>
                {m.summary}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                {m.key_takeaways.map((tip, i) => (
                  <div key={i} style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "flex-start", gap: "0.4rem" }}>
                    <span style={{ color: "var(--cyber-cyan)" }}>•</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Quiz Area */}
      <div className="cyber-card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
          <div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, textTransform: "capitalize" }}>
              Interactive Quiz: {activeCategory.replace("_", " ")}
            </h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Test your ability to spot deceptive stimuli and earn resilience points for your Security Profile.
            </p>
          </div>

          {quizResult && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.4rem 0.85rem",
                borderRadius: "8px",
                background: quizResult.passed ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)",
                border: `1px solid ${quizResult.passed ? "#10b981" : "#ef4444"}`
              }}
            >
              <Award size={18} color={quizResult.passed ? "#34d399" : "#f87171"} />
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: quizResult.passed ? "#34d399" : "#f87171" }}>
                Score: {quizResult.score}% ({quizResult.correct} / {quizResult.total} Correct)
              </span>
            </div>
          )}
        </div>

        {quizData && quizData.questions ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {quizData.questions.map((q, idx) => {
              const userSelection = selectedAnswers[q.id];
              const explanationText = quizResult?.explanations?.[q.id];

              return (
                <div key={q.id} style={{ background: "rgba(11, 15, 25, 0.6)", padding: "1.25rem", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.85rem" }}>
                    Q{idx + 1}. {q.question}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {q.options.map((opt) => {
                      const isChosen = userSelection === opt.key;
                      return (
                        <div
                          key={opt.key}
                          onClick={() => handleSelectOption(q.id, opt.key)}
                          style={{
                            padding: "0.65rem 1rem",
                            borderRadius: "6px",
                            border: `1px solid ${isChosen ? "var(--cyber-cyan)" : "var(--border-subtle)"}`,
                            background: isChosen ? "rgba(0, 242, 254, 0.12)" : "rgba(255, 255, 255, 0.02)",
                            cursor: quizResult ? "default" : "pointer",
                            fontSize: "0.85rem",
                            color: isChosen ? "var(--cyber-cyan)" : "var(--text-secondary)",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            transition: "all var(--transition-fast)"
                          }}
                        >
                          <span className="font-mono" style={{ fontWeight: 700, width: "20px" }}>
                            {opt.key}.
                          </span>
                          <span>{opt.text}</span>
                        </div>
                      );
                    })}
                  </div>

                  {explanationText && (
                    <div style={{ marginTop: "0.85rem", padding: "0.6rem 0.85rem", borderRadius: "6px", background: "rgba(0, 242, 254, 0.06)", border: "1px solid rgba(0, 242, 254, 0.2)", fontSize: "0.8rem", color: "var(--text-main)" }}>
                      💡 {explanationText}
                    </div>
                  )}
                </div>
              );
            })}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
              {quizResult ? (
                <button
                  onClick={() => loadQuiz(activeCategory)}
                  className="cyber-btn cyber-btn-secondary"
                >
                  <RefreshCw size={14} /> Retake Quiz
                </button>
              ) : (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={submitting || Object.keys(selectedAnswers).length === 0}
                  className="cyber-btn cyber-btn-primary"
                  style={{ padding: "0.65rem 1.5rem" }}
                >
                  {submitting ? "Evaluating Answers..." : "Submit Quiz & Update Score"}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
            Loading quiz questions...
          </div>
        )}
      </div>
    </div>
  );
}
