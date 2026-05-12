// ============================================================
// lib/mail.js — Email utility using Resend
// ============================================================
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const FROM_EMAIL = "NextStep AI <onboarding@resend.dev>"; // Use your verified domain in production

// ── Helper: shared email wrapper ────────────────────────────
async function sendEmail({ to, subject, html }) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });
    if (error) throw new Error(error.message);
    return { success: true, id: data?.id };
  } catch (err) {
    console.error("[mail.js] Email send failed:", err.message);
    return { success: false, error: err.message };
  }
}

// ── 1. Verification Email ────────────────────────────────────
export async function sendVerificationEmail(email, name, token) {
  const verifyUrl = `${APP_URL}/verify-email?token=${token}`;
  return sendEmail({
    to: email,
    subject: "Verify your NextStep AI account",
    html: `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px;">
            <tr><td align="center">
              <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:40px 48px;text-align:center;">
                    <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:800;letter-spacing:-0.5px;">NextStep <span style="opacity:0.8;">AI</span></h1>
                    <p style="margin:8px 0 0;color:rgba(255,255,255,0.75);font-size:14px;">Your AI Career Coach</p>
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding:48px;">
                    <h2 style="margin:0 0 16px;color:#0f172a;font-size:22px;font-weight:700;">Verify your email, ${name?.split(" ")[0] || "there"} 👋</h2>
                    <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6;">
                      Welcome to NextStep AI! You're one step away from unlocking AI-powered career coaching. Click the button below to verify your email address.
                    </p>
                    <div style="text-align:center;margin:32px 0;">
                      <a href="${verifyUrl}" style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 36px;border-radius:12px;letter-spacing:0.3px;">
                        ✓ Verify My Email
                      </a>
                    </div>
                    <p style="margin:24px 0 0;color:#94a3b8;font-size:13px;text-align:center;">
                      This link expires in <strong>24 hours</strong>. If you didn't create an account, you can safely ignore this email.
                    </p>
                    <div style="margin-top:24px;padding-top:24px;border-top:1px solid #f1f5f9;">
                      <p style="margin:0;color:#cbd5e1;font-size:12px;word-break:break-all;">Or copy this link: ${verifyUrl}</p>
                    </div>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background:#f8fafc;padding:24px 48px;text-align:center;border-top:1px solid #f1f5f9;">
                    <p style="margin:0;color:#94a3b8;font-size:12px;">© 2026 NextStep AI — Final Year Project</p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body>
      </html>
    `,
  });
}

// ── 2. Password Reset Email ──────────────────────────────────
export async function sendPasswordResetEmail(email, name, token) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;
  return sendEmail({
    to: email,
    subject: "Reset your NextStep AI password",
    html: `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px;">
            <tr><td align="center">
              <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                <tr>
                  <td style="background:linear-gradient(135deg,#dc2626,#9f1239);padding:40px 48px;text-align:center;">
                    <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:800;letter-spacing:-0.5px;">NextStep <span style="opacity:0.8;">AI</span></h1>
                    <p style="margin:8px 0 0;color:rgba(255,255,255,0.75);font-size:14px;">Password Reset Request</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:48px;">
                    <h2 style="margin:0 0 16px;color:#0f172a;font-size:22px;font-weight:700;">Reset your password 🔐</h2>
                    <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6;">
                      Hi ${name?.split(" ")[0] || "there"}, we received a request to reset the password for your account. Click below to choose a new password.
                    </p>
                    <div style="text-align:center;margin:32px 0;">
                      <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#dc2626,#9f1239);color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 36px;border-radius:12px;">
                        🔑 Reset Password
                      </a>
                    </div>
                    <p style="margin:24px 0 0;color:#94a3b8;font-size:13px;text-align:center;">
                      This link expires in <strong>1 hour</strong>. If you didn't request a password reset, please ignore this email — your account is safe.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background:#f8fafc;padding:24px 48px;text-align:center;border-top:1px solid #f1f5f9;">
                    <p style="margin:0;color:#94a3b8;font-size:12px;">© 2026 NextStep AI — Final Year Project</p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body>
      </html>
    `,
  });
}

// ── 3. Welcome Email (sent after email is verified) ──────────
export async function sendWelcomeEmail(email, name) {
  return sendEmail({
    to: email,
    subject: "Welcome to NextStep AI 🚀",
    html: `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px;">
            <tr><td align="center">
              <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                <tr>
                  <td style="background:linear-gradient(135deg,#059669,#0d9488);padding:40px 48px;text-align:center;">
                    <div style="font-size:48px;margin-bottom:12px;">🚀</div>
                    <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:800;">You're in, ${name?.split(" ")[0] || "there"}!</h1>
                    <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Your NextStep AI journey begins now</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:48px;">
                    <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6;">
                      Your email has been verified and your account is fully activated. Here's what you can do with NextStep AI:
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      ${[
        ["📄", "Resume Builder", "Create ATS-optimized resumes with AI assistance"],
        ["🎤", "Interview Prep", "Practice with AI mock interviews and STAR scoring"],
        ["✉️", "Cover Letters", "Generate tailored cover letters in seconds"],
        ["📊", "Industry Insights", "Get real-time market data for your industry"],
      ].map(([icon, title, desc]) => `
                        <tr>
                          <td style="padding:12px 0;border-bottom:1px solid #f1f5f9;">
                            <div style="display:flex;align-items:center;gap:12px;">
                              <span style="font-size:24px;">${icon}</span>
                              <div>
                                <p style="margin:0;font-weight:700;color:#0f172a;font-size:14px;">${title}</p>
                                <p style="margin:4px 0 0;color:#64748b;font-size:13px;">${desc}</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      `).join("")}
                    </table>
                    <div style="text-align:center;margin:36px 0 0;">
                      <a href="${APP_URL}/onboarding" style="display:inline-block;background:linear-gradient(135deg,#059669,#0d9488);color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 36px;border-radius:12px;">
                        🎯 Start Your Journey
                      </a>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="background:#f8fafc;padding:24px 48px;text-align:center;border-top:1px solid #f1f5f9;">
                    <p style="margin:0;color:#94a3b8;font-size:12px;">© 2026 NextStep AI — Final Year Project</p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body>
      </html>
    `,
  });
}
