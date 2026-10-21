from app.schemas import ScoreBreakdown

def compute_unified_risk_score(
    url_reputation_score: float = 0.0,
    message_indicators_score: float = 0.0,
    domain_analysis_score: float = 0.0,
    financial_indicators_score: float = 0.0,
    user_context_score: float = 0.0,
    threat_intel_score: float = 0.0
) -> tuple[float, str, ScoreBreakdown]:
    """
    Computes a deterministic unified risk score (0-100) using weighted multi-factor evaluation:
    - URL Reputation: 20%
    - Message Indicators: 20%
    - Domain Analysis: 15%
    - Financial Indicators: 20%
    - User Context: 10%
    - Threat Intelligence: 15%
    """
    
    # Cap inputs to 0 - 100
    u_rep = min(100.0, max(0.0, url_reputation_score))
    m_ind = min(100.0, max(0.0, message_indicators_score))
    d_ana = min(100.0, max(0.0, domain_analysis_score))
    f_ind = min(100.0, max(0.0, financial_indicators_score))
    u_ctx = min(100.0, max(0.0, user_context_score))
    t_int = min(100.0, max(0.0, threat_intel_score))

    # Calculate weighted composite score
    composite = (
        (u_rep * 0.20) +
        (m_ind * 0.20) +
        (d_ana * 0.15) +
        (f_ind * 0.20) +
        (u_ctx * 0.10) +
        (t_int * 0.15)
    )

    # Critical Escalation Rules:
    # If any single critical signal is verified at 100 (e.g. known malware hash, confirmed blacklisted phishing domain, direct seed phrase theft),
    # the composite score should be elevated to at least 88 to avoid false negatives.
    if max(f_ind, m_ind, t_int, u_rep) >= 95:
        composite = max(composite, 88.0)
    elif max(f_ind, m_ind, t_int, u_rep) >= 75:
        composite = max(composite, 65.0)

    final_score = round(min(100.0, max(5.0, composite)), 1)

    if final_score >= 81:
        level = "CRITICAL"
    elif final_score >= 61:
        level = "HIGH"
    elif final_score >= 41:
        level = "MEDIUM"
    elif final_score >= 21:
        level = "LOW"
    else:
        level = "SAFE"

    breakdown = ScoreBreakdown(
        url_reputation=round(u_rep, 1),
        message_indicators=round(m_ind, 1),
        domain_analysis=round(d_ana, 1),
        financial_indicators=round(f_ind, 1),
        user_context=round(u_ctx, 1),
        threat_intelligence=round(t_int, 1)
    )

    return final_score, level, breakdown
