import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Shield, Lock, Mail, User, ArrowRight, CheckCircle2, Zap } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AuthPage({ mode = "login" }) {
  const [isLogin, setIsLogin] = useState(mode === "login");
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login, register, demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await login(identity, password);
      } else {
        await register(identity, username, password, fullName);
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Authentication failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (role) => {
    setLoading(true);
    try {
      await demoLogin(role);
      navigate("/dashboard");
    } catch (err) {
      setError("Demo authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        background: "var(--bg-primary)"
      }}
    >
      <div className="cyber-card" style={{ maxWidth: "440px", width: "100%", padding: "2.25rem" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #00f2fe 0%, #0ea5e9 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem",
              boxShadow: "0 0 20px rgba(0, 242, 254, 0.4)"
            }}
          >
            <Shield size={26} color="#050b14" />
          </div>
          <h2 className="font-display" style={{ fontSize: "1.4rem", fontWeight: 800 }}>
            {isLogin ? "SIGN IN TO CYBERSHIELD" : "CREATE SECURE ACCOUNT"}
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
            {isLogin ? "Access your unified cyber defense portal" : "Join the intelligent defensive security platform"}
          </p>
        </div>

        {error && (
          <div style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.4)", color: "#fca5a5", padding: "0.75rem", borderRadius: "8px", marginBottom: "1.25rem", fontSize: "0.85rem" }}>
            ⚠ {error}
          </div>
        )}

        {/* 1-Click Demo Buttons */}
        <div style={{ marginBottom: "1.5rem", padding: "0.85rem", background: "rgba(0, 242, 254, 0.05)", border: "1px solid var(--border-cyber)", borderRadius: "8px" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--cyber-cyan)", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <Zap size={13} /> 1-CLICK INSTANT DEMO ACCESS:
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            <button
              type="button"
              onClick={() => handleDemo("user")}
              disabled={loading}
              className="cyber-btn cyber-btn-secondary"
              style={{ fontSize: "0.75rem", padding: "0.45rem" }}
            >
              Alex Morgan (User)
            </button>
            <button
              type="button"
              onClick={() => handleDemo("admin")}
              disabled={loading}
              className="cyber-btn cyber-btn-secondary"
              style={{ fontSize: "0.75rem", padding: "0.45rem", color: "#facc15" }}
            >
              Security Lead (Admin)
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {!isLogin && (
            <>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.35rem" }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Morgan"
                  required
                  className="cyber-input"
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.35rem" }}>
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="alex_cyber"
                  required
                  className="cyber-input"
                />
              </div>
            </>
          )}

          <div>
            <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.35rem" }}>
              {isLogin ? "Username or Email Address" : "Email Address"}
            </label>
            <input
              type={isLogin ? "text" : "email"}
              value={identity}
              onChange={(e) => setIdentity(e.target.value)}
              placeholder={isLogin ? "user@cybershield.ai" : "you@company.com"}
              required
              className="cyber-input"
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.35rem" }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="cyber-input font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="cyber-btn cyber-btn-primary"
            style={{ width: "100%", padding: "0.75rem", marginTop: "0.5rem" }}
          >
            {loading ? "Authenticating..." : isLogin ? "Sign In" : "Register Account"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.825rem", color: "var(--text-muted)" }}>
          {isLogin ? (
            <span>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                style={{ background: "none", border: "none", color: "var(--cyber-cyan)", cursor: "pointer", fontWeight: 600 }}
              >
                Sign Up
              </button>
            </span>
          ) : (
            <span>
              Already registered?{" "}
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                style={{ background: "none", border: "none", color: "var(--cyber-cyan)", cursor: "pointer", fontWeight: 600 }}
              >
                Sign In
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
