// CRIX STUDIO — Email API
// Deploy this on Vercel. Set RESEND_API_KEY in Vercel environment variables.

export default async function handler(req, res) {
  // Allow CORS from Framer
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { type, name, email, projectType, budget, message } = req.body;

  if (!email || !type) {
    return res.status(400).json({ error: "Missing required fields: email, type" });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    return res.status(500).json({ error: "RESEND_API_KEY not set in environment variables" });
  }

  // ─────────────────────────────────────────
  // EMAIL 1 — STEP 1 NUDGE (partial form)
  // ─────────────────────────────────────────
  const step1Html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { background:#010101; font-family: 'Courier New', monospace; color:#F1F1F1; }
    .wrap { max-width:600px; margin:0 auto; background:#010101; }
    .topbar { background:#F82809; height:4px; }
    .header { padding:36px 44px 28px; border-bottom:1px solid #1a1a1a; }
    .logo { font-size:20px; font-weight:700; letter-spacing:0.15em; color:#F1F1F1; text-transform:uppercase; }
    .logo span { color:#F82809; }
    .hero { padding:48px 44px 36px; }
    .label { font-size:10px; letter-spacing:0.3em; color:#F82809; text-transform:uppercase; margin-bottom:18px; }
    .headline { font-size:30px; font-weight:700; line-height:1.15; text-transform:uppercase; color:#F1F1F1; margin-bottom:20px; letter-spacing:-0.01em; }
    .headline em { color:#F82809; font-style:normal; }
    .body-text { font-size:13px; line-height:1.85; color:#777; }
    .body-text strong { color:#F1F1F1; }
    .divider { margin:0 44px; height:1px; background:linear-gradient(90deg,#F82809 0%,#111 100%); }
    .cta { padding:36px 44px; }
    .cta p { font-size:13px; line-height:1.8; color:#777; margin-bottom:28px; }
    .cta p strong { color:#F1F1F1; }
    .btn { display:inline-block; background:#F82809; color:#F1F1F1 !important; text-decoration:none; font-family:'Courier New',monospace; font-size:11px; font-weight:700; letter-spacing:0.2em; text-transform:uppercase; padding:15px 32px; }
    .steps { padding:0 44px 40px; }
    .steps-label { font-size:10px; letter-spacing:0.3em; color:#333; text-transform:uppercase; margin-bottom:18px; }
    .step { display:flex; gap:14px; margin-bottom:14px; }
    .step-num { font-size:11px; font-weight:700; color:#F82809; min-width:22px; padding-top:1px; }
    .step-text { font-size:12px; color:#555; line-height:1.7; }
    .step-text strong { color:#F1F1F1; display:block; margin-bottom:2px; }
    .footer { padding:28px 44px; border-top:1px solid #111; }
    .footer-tag { font-size:10px; letter-spacing:0.25em; color:#2a2a2a; text-transform:uppercase; margin-bottom:10px; }
    .footer-links { font-size:11px; color:#444; }
    .footer-links a { color:#F82809; text-decoration:none; }
    .botbar { background:#F82809; height:2px; }
  </style>
</head>
<body>
<div class="wrap">
  <div class="topbar"></div>
  <div class="header">
    <div class="logo">CRIX<span>.</span>STUDIO</div>
  </div>
  <div class="hero">
    <div class="label">// YOU STARTED SOMETHING.</div>
    <h1 class="headline">DON'T LEAVE<br/>IT <em>HALF-DONE.</em></h1>
    <p class="body-text">
      Hey <strong>${name || "there"}</strong> — we got your details.<br/>
      Now tell us what you actually need. Takes 2 minutes.
    </p>
  </div>
  <div class="divider"></div>
  <div class="cta">
    <p>No fluff questions. No BS. Just tell us about your brand and where you need firepower — and we'll tell you straight if we're the right fit.</p>
    <a href="https://crixstudio.com" class="btn">COMPLETE THE FORM →</a>
  </div>
  <div class="steps">
    <div class="steps-label">// WHAT HAPPENS NEXT</div>
    <div class="step">
      <div class="step-num">01</div>
      <div class="step-text"><strong>YOU FILL THE FORM</strong>2 minutes. Tell us what you need.</div>
    </div>
    <div class="step">
      <div class="step-num">02</div>
      <div class="step-text"><strong>WE REVIEW IT</strong>We look at your brand, your goals, your gaps.</div>
    </div>
    <div class="step">
      <div class="step-num">03</div>
      <div class="step-text"><strong>WE GET ON A CALL</strong>No pitch deck. No pressure. Just straight talk.</div>
    </div>
  </div>
  <div class="footer">
    <div class="footer-tag">// WE KNOW HOW TO GET SH*T DONE.</div>
    <div class="footer-links">
      <a href="https://crixbuild.framer.ai">crixbuild.framer.ai</a>
      &nbsp;·&nbsp;
      <a href="https://instagram.com/crix.studio">@crix.studio</a>
    </div>
  </div>
  <div class="botbar"></div>
</div>
</body>
</html>`;

  // ─────────────────────────────────────────
  // EMAIL 2 — FULL CONFIRMATION
  // ─────────────────────────────────────────
  const step2Html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { background:#010101; font-family:'Courier New',monospace; color:#F1F1F1; }
    .wrap { max-width:600px; margin:0 auto; background:#010101; }
    .topbar { background:#F82809; height:4px; }
    .header { padding:36px 44px 28px; border-bottom:1px solid #1a1a1a; display:flex; justify-content:space-between; align-items:center; }
    .logo { font-size:20px; font-weight:700; letter-spacing:0.15em; color:#F1F1F1; text-transform:uppercase; }
    .logo span { color:#F82809; }
    .badge { font-size:9px; letter-spacing:0.2em; color:#F82809; text-transform:uppercase; border:1px solid #F82809; padding:5px 10px; }
    .hero { padding:48px 44px 36px; }
    .label { font-size:10px; letter-spacing:0.3em; color:#F82809; text-transform:uppercase; margin-bottom:18px; }
    .headline { font-size:30px; font-weight:700; line-height:1.15; text-transform:uppercase; color:#F1F1F1; margin-bottom:20px; }
    .headline em { color:#F82809; font-style:normal; }
    .body-text { font-size:13px; line-height:1.85; color:#777; }
    .body-text strong { color:#F1F1F1; }
    .divider { margin:0 44px; height:1px; background:linear-gradient(90deg,#F82809 0%,#111 100%); }
    .summary { padding:36px 44px; }
    .summary-label { font-size:10px; letter-spacing:0.3em; color:#333; text-transform:uppercase; margin-bottom:20px; }
    .summary-row { display:flex; justify-content:space-between; padding:12px 0; border-bottom:1px solid #111; }
    .summary-key { font-size:11px; letter-spacing:0.1em; color:#444; text-transform:uppercase; }
    .summary-val { font-size:12px; color:#F1F1F1; text-align:right; max-width:60%; }
    .next { padding:0 44px 40px; }
    .next-label { font-size:10px; letter-spacing:0.3em; color:#333; text-transform:uppercase; margin-bottom:18px; }
    .next-text { font-size:13px; line-height:1.85; color:#555; }
    .next-text strong { color:#F1F1F1; }
    .footer { padding:28px 44px; border-top:1px solid #111; }
    .footer-tag { font-size:10px; letter-spacing:0.25em; color:#2a2a2a; text-transform:uppercase; margin-bottom:10px; }
    .footer-links { font-size:11px; color:#444; }
    .footer-links a { color:#F82809; text-decoration:none; }
    .botbar { background:#F82809; height:2px; }
  </style>
</head>
<body>
<div class="wrap">
  <div class="topbar"></div>
  <div class="header">
    <div class="logo">CRIX<span>.</span>STUDIO</div>
    <div class="badge">✓ RECEIVED</div>
  </div>
  <div class="hero">
    <div class="label">// SUBMISSION CONFIRMED.</div>
    <h1 class="headline">WE GOT IT,<br/><em>${name ? name.toUpperCase() : "LET'S GO"}.</em></h1>
    <p class="body-text">
      Your inquiry is in. We don't sit on things — expect to hear from us <strong>within 24 hours.</strong><br/>
      Here's everything you submitted, for your records.
    </p>
  </div>
  <div class="divider"></div>
  <div class="summary">
    <div class="summary-label">// YOUR SUBMISSION</div>
    <div class="summary-row">
      <span class="summary-key">NAME</span>
      <span class="summary-val">${name || "—"}</span>
    </div>
    <div class="summary-row">
      <span class="summary-key">EMAIL</span>
      <span class="summary-val">${email || "—"}</span>
    </div>
    <div class="summary-row">
      <span class="summary-key">PROJECT TYPE</span>
      <span class="summary-val">${projectType || "—"}</span>
    </div>
    <div class="summary-row">
      <span class="summary-key">BUDGET RANGE</span>
      <span class="summary-val">${budget || "—"}</span>
    </div>
    ${message ? `
    <div class="summary-row">
      <span class="summary-key">MESSAGE</span>
      <span class="summary-val">${message}</span>
    </div>` : ""}
  </div>
  <div class="next">
    <div class="next-label">// WHAT HAPPENS NOW</div>
    <p class="next-text">
      Our team reviews your brief and gets back to you <strong>within 24 hours.</strong><br/><br/>
      We'll set up a quick call — no pitch decks, no pressure. Just a straight conversation about what you need and whether we're the right people to build it.<br/><br/>
      <strong>If it's urgent — DM us on Instagram.</strong>
    </p>
  </div>
  <div class="footer">
    <div class="footer-tag">// WE KNOW HOW TO GET SH*T DONE.</div>
    <div class="footer-links">
      <a href="https://crixbuild.framer.ai">crixbuild.framer.ai</a>
      &nbsp;·&nbsp;
      <a href="https://instagram.com/crix.studio">@crix.studio</a>
    </div>
  </div>
  <div class="botbar"></div>
</div>
</body>
</html>`;

  // ─────────────────────────────────────────
  // SEND VIA RESEND
  // ─────────────────────────────────────────
  const isStep1 = type === "step1";

  const emailPayload = {
    from: "CRIX STUDIO <founder@crixstudio.com>",
    to: [email],
    subject: isStep1
      ? "Don't leave it half-done. — CRIX STUDIO"
      : `Got it, ${name || "legend"}. We'll be in touch. — CRIX STUDIO`,
    html: isStep1 ? step1Html : step2Html,
  };

  try {
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailPayload),
    });

    const resendData = await resendRes.json();

    if (!resendRes.ok) {
      return res.status(500).json({ error: "Resend error", details: resendData });
    }

    return res.status(200).json({ success: true, id: resendData.id });
  } catch (err) {
    return res.status(500).json({ error: "Failed to send email", details: err.message });
  }
}
