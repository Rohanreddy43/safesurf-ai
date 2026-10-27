import io
from typing import Dict, Any
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def generate_pdf_report(scan_data: Dict[str, Any]) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    story = []
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=24,
        leading=28,
        textColor=colors.HexColor('#0F172A'),
        spaceAfter=10
    )
    
    meta_style = ParagraphStyle(
        'MetaStyle',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#64748B')
    )

    body_style = ParagraphStyle(
        'BodyStyle',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#334155')
    )

    # Header
    story.append(Paragraph("<b>SafeSurf AI - Security Audit Report</b>", title_style))
    story.append(Paragraph(f"Target URL: <b>{scan_data.get('url')}</b> | Domain: <b>{scan_data.get('domain')}</b>", meta_style))
    story.append(Paragraph(f"Scan Date: {scan_data.get('created_at')} | Status: <b>{scan_data.get('status', '').upper()}</b> | Trust Score: <b>{scan_data.get('risk_score')}/100</b>", meta_style))
    story.append(Spacer(1, 12))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#3B82F6'), spaceAfter=15))

    # Executive Summary
    story.append(Paragraph("<b>Executive Summary & AI Explanation</b>", styles['Heading2']))
    summary_text = scan_data.get('summary', 'No summary provided.').replace('\n', '<br/>')
    story.append(Paragraph(summary_text, body_style))
    story.append(Spacer(1, 15))

    # Security Modules Breakdown Table
    story.append(Paragraph("<b>Security Inspection Breakdown</b>", styles['Heading2']))
    
    report_modules = scan_data.get('report_data', {}).get('modules', {})
    
    table_data = [
        [Paragraph("<b>Module</b>", body_style), Paragraph("<b>Findings / Status</b>", body_style)]
    ]

    # SSL
    ssl_info = report_modules.get('ssl', {})
    table_data.append([
        Paragraph("SSL Certificate", body_style),
        Paragraph(f"Issuer: {ssl_info.get('issuer', 'N/A')} | TLS: {ssl_info.get('tls_version', 'N/A')} | Valid: {ssl_info.get('valid')}", body_style)
    ])

    # DNS
    dns_info = report_modules.get('dns', {})
    has_a = dns_info.get('has_a_record')
    table_data.append([
        Paragraph("DNS Resolution", body_style),
        Paragraph(f"A Records Active: {has_a} | SPF Record: {dns_info.get('has_spf')}", body_style)
    ])

    # WHOIS
    whois_info = report_modules.get('whois', {})
    table_data.append([
        Paragraph("WHOIS Domain Age", body_style),
        Paragraph(f"Age: {whois_info.get('domain_age_days', 'N/A')} days | Registrar: {whois_info.get('registrar', 'N/A')}", body_style)
    ])

    # Hosting
    hosting_info = report_modules.get('hosting', {})
    table_data.append([
        Paragraph("Hosting Provider", body_style),
        Paragraph(f"IP: {hosting_info.get('ip_address')} | Location: {hosting_info.get('city')}, {hosting_info.get('country')} | ISP: {hosting_info.get('isp')}", body_style)
    ])

    # Threat Intel
    intel_info = report_modules.get('threat_intelligence', {})
    table_data.append([
        Paragraph("Threat Intelligence", body_style),
        Paragraph(f"Status: {intel_info.get('status')} | Flagged Vendors: {intel_info.get('flagged_count', 0)}", body_style)
    ])

    t = Table(table_data, colWidths=[150, 390])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F1F5F9')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#0F172A')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('PADDING', (0, 0), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(t)
    story.append(Spacer(1, 20))

    # Recommendations
    story.append(Paragraph("<b>Security Recommendations</b>", styles['Heading2']))
    recs = [
        "1. Never enter sensitive passwords or payment details on URLs flagged as Suspicious or Malicious.",
        "2. Verify SSL certificate issuer domain directly in browser lock icon.",
        "3. Inspect domain spelling carefully to avoid phishing homograph or typosquatting traps.",
        "4. Enforce security response headers (CSP, HSTS, X-Frame-Options) on hosted web apps."
    ]
    for rec in recs:
        story.append(Paragraph(rec, body_style))
        story.append(Spacer(1, 4))

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()
