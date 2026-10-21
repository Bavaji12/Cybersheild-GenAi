import io
import datetime
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def generate_pdf_report(scan_data: dict) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    # Custom CyberShield styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        textColor=colors.HexColor('#0f172a'),
        spaceAfter=12
    )
    
    header_style = ParagraphStyle(
        'SectionHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        textColor=colors.HexColor('#0284c7'),
        spaceBefore=10,
        spaceAfter=6
    )
    
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        textColor=colors.HexColor('#334155'),
        leading=13
    )

    elements = []

    # Title & Badge
    elements.append(Paragraph("CYBERSHIELD – GENAI FORENSIC THREAT REPORT", title_style))
    elements.append(Paragraph(f"Generated on: {datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')} | Reference ID: CS-{scan_data.get('scan_id', '9901')}", body_style))
    elements.append(Spacer(1, 12))

    # Executive Summary Table
    risk_score = scan_data.get("risk_score", 0)
    risk_level = scan_data.get("risk_level", "SAFE")
    
    # Color badge
    bg_color = colors.HexColor('#ef4444') if risk_score >= 80 else colors.HexColor('#f97316') if risk_score >= 60 else colors.HexColor('#eab308') if risk_score >= 40 else colors.HexColor('#10b981')
    
    summary_data = [
        ["Threat Classification:", scan_data.get("threat_category", "Unknown Threat")],
        ["Risk Assessment Score:", f"{risk_score} / 100 ({risk_level})"],
        ["Input Vector Type:", scan_data.get("scan_type", "Unknown").upper()],
        ["Analysis Timestamp:", scan_data.get("created_at", str(datetime.datetime.utcnow()))[:19]]
    ]
    
    summary_table = Table(summary_data, colWidths=[150, 390])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#0f172a')),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
    ]))
    elements.append(summary_table)
    elements.append(Spacer(1, 14))

    # Analyzed Target Preview
    elements.append(Paragraph("1. INSPECTED TARGET", header_style))
    input_text = scan_data.get("input_preview", "None provided")
    elements.append(Paragraph(f"<code>{input_text[:250]}</code>", body_style))
    elements.append(Spacer(1, 10))

    # Detected Indicators
    elements.append(Paragraph("2. FORENSIC INDICATORS DETECTED", header_style))
    indicators = scan_data.get("indicators", [])
    if indicators:
        for ind in indicators:
            elements.append(Paragraph(f"• <b>[FLAG]</b> {ind}", body_style))
    else:
        elements.append(Paragraph("• No malicious or anomalous indicators identified.", body_style))
    elements.append(Spacer(1, 10))

    # Explanation & Potential Impact
    elements.append(Paragraph("3. THREAT EXPLANATION & POTENTIAL IMPACT", header_style))
    explanation = scan_data.get("explanation", "Analysis completed successfully.")
    elements.append(Paragraph(explanation, body_style))
    elements.append(Spacer(1, 10))

    # Prioritized Preventive & Recovery Actions
    elements.append(Paragraph("4. PRIORITIZED DEFENSIVE & RECOVERY RECOMMENDATIONS", header_style))
    actions = scan_data.get("preventive_actions", [])
    if actions:
        for act in actions:
            elements.append(Paragraph(f"✓ {act}", body_style))
    else:
        elements.append(Paragraph("✓ Continue following standard cybersecurity hygiene procedures.", body_style))
    elements.append(Spacer(1, 14))

    # Copilot Insights
    copilot_text = scan_data.get("copilot_explanation")
    if copilot_text:
        elements.append(Paragraph("5. CYBERSHIELD COPILOT SUMMARY", header_style))
        clean_copilot = copilot_text.replace("#", "").replace("*", "")
        elements.append(Paragraph(clean_copilot[:600] + "...", body_style))
        elements.append(Spacer(1, 14))

    # Footer Disclaimer
    disclaimer_style = ParagraphStyle(
        'Disclaimer',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=7,
        textColor=colors.HexColor('#64748b')
    )
    elements.append(Paragraph("CONFIDENTIALITY & DISCLAIMER: This report is generated by CyberShield – GenAI for defensive risk assessment. CyberShield does not claim absolute certainty. For emergency financial containment, contact your financial institution directly.", disclaimer_style))

    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()
