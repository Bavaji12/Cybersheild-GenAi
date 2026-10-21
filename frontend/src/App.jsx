import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

// Pages
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import UniversalAnalyzer from "./pages/UniversalAnalyzer";
import FinancialSecurityPage from "./pages/FinancialSecurityPage";
import TechnologySecurityPage from "./pages/TechnologySecurityPage";
import AttackChainPage from "./pages/AttackChainPage";
import SecurityCopilotPage from "./pages/SecurityCopilotPage";
import IncidentsPage from "./pages/IncidentsPage";
import RiskProfilePage from "./pages/RiskProfilePage";
import ThreatIntelPage from "./pages/ThreatIntelPage";
import ReportsPage from "./pages/ReportsPage";
import AwarenessPage from "./pages/AwarenessPage";
import AdminPage from "./pages/AdminPage";
import SettingsPage from "./pages/SettingsPage";
import AuthPage from "./pages/AuthPage";

function Layout({ children }) {
  const location = useLocation();
  const isAuthOrLanding = ["/", "/login", "/register"].includes(location.pathname);

  if (isAuthOrLanding) {
    return children;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <main className="content-body">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            {/* Public Entry */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<AuthPage mode="login" />} />
            <Route path="/register" element={<AuthPage mode="register" />} />

            {/* Core Command Center */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/analyzer" element={<UniversalAnalyzer />} />

            {/* Specialized Security Engines */}
            <Route path="/financial-security" element={<FinancialSecurityPage />} />
            <Route path="/technology-security" element={<TechnologySecurityPage />} />
            <Route path="/attack-chain" element={<AttackChainPage />} />
            <Route path="/security-copilot" element={<SecurityCopilotPage />} />

            {/* Incident & Response */}
            <Route path="/incidents" element={<IncidentsPage />} />
            <Route path="/threat-intelligence" element={<ThreatIntelPage />} />
            <Route path="/risk-profile" element={<RiskProfilePage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/awareness" element={<AwarenessPage />} />

            {/* Admin & Settings */}
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/settings" element={<SettingsPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}
