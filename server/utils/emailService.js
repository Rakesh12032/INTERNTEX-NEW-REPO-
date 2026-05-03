import nodemailer from "nodemailer";

const hasEmailConfig = Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS && !process.env.EMAIL_USER.includes("your_"));
const clientUrl = (process.env.CLIENT_URL || "http://localhost:3000").replace(/\/$/, "");

const transporter = hasEmailConfig
  ? nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    })
  : null;

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function sendMail({ to, subject, html }) {
  if (!transporter) {
    console.log(`Email skipped for ${to}: ${subject}`);
    return { skipped: true };
  }

  return transporter.sendMail({
    from: `"InternTech" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  });
}

export async function sendOTPEmail(email, otp, name) {
  return sendMail({
    to: email,
    subject: "Your InternTech OTP",
    html: `
      <div style="font-family:Inter,Arial,sans-serif;padding:24px;background:#f8fafc;color:#0f172a">
        <h2 style="margin-bottom:12px;">Hi ${name},</h2>
        <p>Your InternTech verification code is:</p>
        <div style="font-size:32px;font-weight:700;letter-spacing:8px;color:#2563EB;margin:18px 0;">${otp}</div>
        <p>This OTP will expire in 10 minutes.</p>
      </div>
    `
  });
}

export async function sendWelcomeEmail(email, name) {
  const safeName = escapeHtml(name || "Learner");

  return sendMail({
    to: email,
    subject: "Welcome to Interntex - Your learning journey starts now",
    html: `
      <div style="margin:0;padding:0;background:#f3f6fb;font-family:Inter,Arial,sans-serif;color:#0f172a;">
        <div style="max-width:640px;margin:0 auto;padding:28px 16px;">
          <div style="background:#071225;border-radius:24px 24px 0 0;padding:26px 28px;color:#ffffff;">
            <div style="font-size:13px;letter-spacing:4px;text-transform:uppercase;color:#7dd3fc;font-weight:800;">interntex</div>
            <h1 style="margin:16px 0 8px;font-size:28px;line-height:1.25;">Welcome, ${safeName}!</h1>
            <p style="margin:0;color:#dbeafe;font-size:15px;line-height:1.7;">Your account is active. Learn practical skills, build projects, unlock certificates, and move closer to internships.</p>
          </div>

          <div style="background:#ffffff;border:1px solid #e2e8f0;border-top:0;padding:28px;border-radius:0 0 24px 24px;">
            <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:18px;padding:18px 20px;margin-bottom:22px;">
              <div style="font-size:13px;font-weight:900;color:#2563eb;text-transform:uppercase;letter-spacing:1px;">Welcome Benefits</div>
              <h2 style="margin:8px 0 10px;font-size:21px;color:#0f172a;">Your starter pack is ready</h2>
              <p style="margin:0;color:#334155;font-size:14px;line-height:1.7;">Start with beginner-friendly courses, guided lessons, progress tracking, certificate eligibility, and internship/job updates from the Interntex dashboard.</p>
            </div>

            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:0 0 22px;">
              <tr>
                <td style="padding:12px 0;border-bottom:1px solid #eef2f7;">
                  <strong style="display:block;color:#0f172a;">1. Pick your first course</strong>
                  <span style="color:#64748b;font-size:14px;">Choose Full Stack, Python, Data Science, UI/UX, DSA, or another career track.</span>
                </td>
              </tr>
              <tr>
                <td style="padding:12px 0;border-bottom:1px solid #eef2f7;">
                  <strong style="display:block;color:#0f172a;">2. Complete lessons and quizzes</strong>
                  <span style="color:#64748b;font-size:14px;">Track your progress and prepare for certificate completion.</span>
                </td>
              </tr>
              <tr>
                <td style="padding:12px 0;">
                  <strong style="display:block;color:#0f172a;">3. Apply for internships and jobs</strong>
                  <span style="color:#64748b;font-size:14px;">Use your profile, certificates, and projects to find better opportunities.</span>
                </td>
              </tr>
            </table>

            <div style="background:#ecfdf5;border:1px solid #bbf7d0;border-radius:18px;padding:18px 20px;margin-bottom:24px;">
              <strong style="display:block;color:#047857;font-size:15px;">Introductory Offer</strong>
              <p style="margin:8px 0 0;color:#065f46;font-size:14px;line-height:1.7;">Complete your first lesson this week and keep your learning streak active. Early learners get priority access to new course launches, certificates, and internship updates.</p>
            </div>

            <a href="${clientUrl}/courses" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:800;border-radius:14px;padding:14px 22px;">Start Learning</a>

            <p style="margin:24px 0 0;color:#64748b;font-size:13px;line-height:1.7;">Need help? Reply to this email and the Interntex team will guide you.</p>
          </div>
        </div>
      </div>
    `
  });
}

export async function sendCertificateEmail(email, name, courseName, certId) {
  return sendMail({
    to: email,
    subject: "Your InternTech Certificate",
    html: `<div style="font-family:Inter,Arial,sans-serif;padding:24px;"><h2>Congratulations ${name}</h2><p>Your certificate for <strong>${courseName}</strong> has been issued.</p><p>Certificate ID: <strong>${certId}</strong></p></div>`
  });
}

export async function sendWithdrawalEmail(email, name, amount, status) {
  return sendMail({
    to: email,
    subject: `Withdrawal ${status} - InternTech`,
    html: `<div style="font-family:Inter,Arial,sans-serif;padding:24px;"><h2>Hello ${name}</h2><p>Your withdrawal request of <strong>₹${amount}</strong> is currently <strong>${status}</strong>.</p></div>`
  });
}

export async function sendWeeklyReport(email, name, stats) {
  return sendMail({
    to: email,
    subject: "Your Weekly InternTech Progress Report",
    html: `<div style="font-family:Inter,Arial,sans-serif;padding:24px;"><h2>Weekly Report for ${name}</h2><p>Lessons completed: ${stats.lessonsCompleted || 0}</p><p>Quiz attempts: ${stats.quizAttempts || 0}</p><p>Certificates earned: ${stats.certificatesEarned || 0}</p></div>`
  });
}
