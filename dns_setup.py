from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import cm

doc = SimpleDocTemplate(
    "/Users/esrademirturk/Desktop/gold_in_balance_website/dns_setup.pdf",
    pagesize=A4,
    rightMargin=2*cm, leftMargin=2*cm,
    topMargin=2*cm, bottomMargin=2*cm
)

styles = getSampleStyleSheet()
teal = colors.HexColor("#1B6B7B")
gold = colors.HexColor("#D4A843")
dark = colors.HexColor("#0C3840")

title_style = ParagraphStyle("title", parent=styles["Title"], textColor=teal, fontSize=20, spaceAfter=6)
sub_style = ParagraphStyle("sub", parent=styles["Normal"], textColor=colors.HexColor("#4A7A87"), fontSize=11, spaceAfter=16)
heading_style = ParagraphStyle("heading", parent=styles["Heading2"], textColor=dark, fontSize=13, spaceBefore=16, spaceAfter=8)
note_style = ParagraphStyle("note", parent=styles["Normal"], fontSize=10, textColor=colors.HexColor("#555555"), spaceAfter=8)

story = []

story.append(Paragraph("Gold in Balance — DNS Setup", title_style))
story.append(Paragraph("Resend e-mail configuratie voor goldinbalance.nl", sub_style))
story.append(Paragraph("Voeg de volgende DNS-records toe via Siteground → Site Tools → Domain → DNS Zone Editor.", note_style))

story.append(Spacer(1, 0.3*cm))

story.append(Paragraph("1. DKIM Record (TXT)", heading_style))
data1 = [
    ["Field", "Value"],
    ["Type", "TXT"],
    ["Name", "resend._domainkey"],
    ["Value", "p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCxLy5nFe+xb/rs7C5Gb4C5lQ\nzlpsjb1eCMPVB3Tdddx7mL9ud9/lTzh79INtp4grVr+FlM2vIz7Lw5IKgplz+F\nU0hwYDs1eHzpb2BYidid0jxlg+kMTaUpIZtLW3Gmgxk17V6biJPhM2sIpuRMmI\n8Fhl6Ovb0AOpQbs6Qzd04AAwIDAQAB"],
    ["TTL", "3600"],
]
t1 = Table(data1, colWidths=[3.5*cm, 13*cm])
t1.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,0), teal),
    ("TEXTCOLOR", (0,0), (-1,0), colors.white),
    ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
    ("FONTSIZE", (0,0), (-1,-1), 9),
    ("BACKGROUND", (0,1), (0,-1), colors.HexColor("#F4F9FA")),
    ("FONTNAME", (0,1), (0,-1), "Helvetica-Bold"),
    ("GRID", (0,0), (-1,-1), 0.5, colors.HexColor("#D9EDF1")),
    ("VALIGN", (0,0), (-1,-1), "TOP"),
    ("PADDING", (0,0), (-1,-1), 6),
    ("WORDWRAP", (1,0), (1,-1), True),
]))
story.append(t1)

story.append(Paragraph("2. MX Record", heading_style))
data2 = [
    ["Field", "Value"],
    ["Type", "MX"],
    ["Name", "send"],
    ["Value", "feedback-smtp.eu-west-1.amazonses.com"],
    ["Priority", "10"],
    ["TTL", "3600"],
]
t2 = Table(data2, colWidths=[3.5*cm, 13*cm])
t2.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,0), teal),
    ("TEXTCOLOR", (0,0), (-1,0), colors.white),
    ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
    ("FONTSIZE", (0,0), (-1,-1), 9),
    ("BACKGROUND", (0,1), (0,-1), colors.HexColor("#F4F9FA")),
    ("FONTNAME", (0,1), (0,-1), "Helvetica-Bold"),
    ("GRID", (0,0), (-1,-1), 0.5, colors.HexColor("#D9EDF1")),
    ("VALIGN", (0,0), (-1,-1), "TOP"),
    ("PADDING", (0,0), (-1,-1), 6),
]))
story.append(t2)

story.append(Paragraph("3. SPF Record (TXT)", heading_style))
data3 = [
    ["Field", "Value"],
    ["Type", "TXT"],
    ["Name", "@"],
    ["Value", "v=spf1 include:amazonses.com ~all"],
    ["TTL", "3600"],
]
t3 = Table(data3, colWidths=[3.5*cm, 13*cm])
t3.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,0), teal),
    ("TEXTCOLOR", (0,0), (-1,0), colors.white),
    ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
    ("FONTSIZE", (0,0), (-1,-1), 9),
    ("BACKGROUND", (0,1), (0,-1), colors.HexColor("#F4F9FA")),
    ("FONTNAME", (0,1), (0,-1), "Helvetica-Bold"),
    ("GRID", (0,0), (-1,-1), 0.5, colors.HexColor("#D9EDF1")),
    ("VALIGN", (0,0), (-1,-1), "TOP"),
    ("PADDING", (0,0), (-1,-1), 6),
]))
story.append(t3)


story.append(Spacer(1, 1*cm))
story.append(Paragraph("Gold In Balance · Keizersgracht 316, 1016 EZ Amsterdam · info@goldinbalance.nl",
    ParagraphStyle("footer", parent=styles["Normal"], fontSize=8, textColor=colors.HexColor("#999999"))))

doc.build(story)
print("PDF created.")
