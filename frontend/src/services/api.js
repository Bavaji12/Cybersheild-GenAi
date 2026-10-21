const API_BASE = "http://localhost:8000/api";

function getHeaders() {
  const token = localStorage.getItem("cybershield_token");
  const headers = {
    "Content-Type": "application/json"
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = { ...getHeaders(), ...(options.headers || {}) };

  try {
    const res = await fetch(url, {
      ...options,
      headers
    });

    if (res.status === 401) {
      // Optional: clear token on expired auth
      // localStorage.removeItem("cybershield_token");
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Network request failed" }));
      throw new Error(err.detail || `Error ${res.status}: ${res.statusText}`);
    }

    // Check if response is json or blob
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/pdf")) {
      return res.blob();
    }
    return await res.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

export const api = {
  // Auth
  auth: {
    login: (credentials) => request("/auth/login", { method: "POST", body: JSON.stringify(credentials) }),
    register: (userData) => request("/auth/register", { method: "POST", body: JSON.stringify(userData) }),
    getMe: () => request("/auth/me"),
    getProfile: () => request("/auth/profile"),
    toggleMfa: () => request("/auth/toggle-mfa", { method: "POST" })
  },

  // Analyzers & Scans
  scan: {
    executeScan: (payload) => request("/analyze/scan", { method: "POST", body: JSON.stringify(payload) }),
    getHistory: (limit = 20) => request(`/analyze/history?limit=${limit}`),
    getDetails: (scanId) => request(`/analyze/${scanId}`)
  },

  // Dashboard
  dashboard: {
    getSummary: () => request("/dashboard/summary")
  },

  // Copilot
  copilot: {
    chat: (payload) => request("/copilot/chat", { method: "POST", body: JSON.stringify(payload) }),
    explainScan: (scanId) => request(`/copilot/explain/${scanId}`)
  },

  // Attack Chain
  attackChain: {
    generate: (payload) => request("/attack-chain/generate", { method: "POST", body: JSON.stringify(payload) })
  },

  // Incidents
  incidents: {
    report: (payload) => request("/incidents/report", { method: "POST", body: JSON.stringify(payload) }),
    list: () => request("/incidents"),
    toggleAction: (actionId) => request(`/incidents/action/${actionId}/toggle`, { method: "PATCH" })
  },

  // Threat Intel
  intel: {
    lookup: (payload) => request("/threat-intel/lookup", { method: "POST", body: JSON.stringify(payload) }),
    getFeed: () => request("/threat-intel/feed")
  },

  // Reports
  reports: {
    list: () => request("/reports"),
    downloadPdfUrl: (scanId) => `${API_BASE}/reports/${scanId}/download-pdf`,
    downloadJsonUrl: (scanId) => `${API_BASE}/reports/${scanId}/json`
  },

  // Awareness & Quizzes
  awareness: {
    getModules: () => request("/awareness/modules"),
    getQuiz: (category) => request(`/awareness/quiz/${category}`),
    submitQuiz: (payload) => request("/awareness/quiz/submit", { method: "POST", body: JSON.stringify(payload) })
  },

  // Admin
  admin: {
    getMetrics: () => request("/admin/metrics"),
    getAuditLogs: () => request("/admin/audit-logs")
  }
};
