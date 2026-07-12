const nodemailer = require('nodemailer');

// Sends an email using whichever provider is configured in .env:
//   1) Resend (RESEND_API_KEY)          — recommended, 100 free emails/day
//   2) SMTP / Gmail (SMTP_HOST etc.)    — fallback
//   3) Neither configured               — logs to console so nothing crashes
//      during local development/testing before you've set up either one.
async function sendEmail({ to, subject, html, text }) {
  const from = process.env.EMAIL_FROM || 'Adevos-X <no-reply@adevosx.site>';

  if (process.env.RESEND_API_KEY) {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to, subject, html: html || text }),
    });
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Resend API error: ${response.status} ${body}`);
    }
    return { provider: 'resend' };
  }

  if (process.env.SMTP_HOST) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    await transporter.sendMail({ from, to, subject, html: html || text, text });
    return { provider: 'smtp' };
  }

  console.log(`✉️  [EMAIL NOT SENT — no provider configured] To: ${to} | Subject: ${subject}`);
  return { provider: 'none-logged-only' };
}

module.exports = { sendEmail };
