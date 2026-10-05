const nodemailer = require('nodemailer');

let transporter = null;

/**
 * Lazily create and verify the SMTP transporter.
 * Throws a clear error if credentials are missing.
 */
const getTransporter = () => {
  if (transporter) return transporter;

  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;

  if (!user || !pass || pass === 'PASTE_YOUR_16_CHAR_APP_PASSWORD_HERE') {
    throw new Error(
      'Email not configured. Set EMAIL_USER and EMAIL_PASSWORD (Gmail App Password) in server/.env. ' +
      'Enable 2FA at myaccount.google.com, then create an App Password at myaccount.google.com/apppasswords.'
    );
  }

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });

  return transporter;
};

/**
 * Send the contact form email to the support inbox.
 * @param {object} opts
 * @param {string} opts.name       - Sender name
 * @param {string} opts.email      - Sender email (used as Reply-To)
 * @param {string} opts.subject    - Message subject
 * @param {string} opts.message    - Message body
 */
const sendContactEmail = async ({ name, email, subject, message }) => {
  const t          = getTransporter();
  const recipient  = process.env.CONTACT_EMAIL || 'supportebookcreator@gmail.com';
  const submittedAt = new Date().toLocaleString('en-IN', {
    timeZone:     'Asia/Kolkata',
    dateStyle:    'full',
    timeStyle:    'short',
  });

  const html = `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
      <div style="background:#2563EB;padding:24px 32px">
        <h2 style="color:#fff;margin:0;font-size:20px">📬 New Contact Form Submission</h2>
        <p style="color:rgba(255,255,255,.8);margin:6px 0 0;font-size:13px">AI eBook Creator — Support</p>
      </div>
      <div style="padding:32px">
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;color:#6b7280;font-size:13px;width:100px">Name</td>
              <td style="padding:8px 0;font-weight:600;color:#111827;font-size:13px">${escapeHtml(name)}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;font-size:13px">Email</td>
              <td style="padding:8px 0;font-weight:600;color:#111827;font-size:13px">
                <a href="mailto:${escapeHtml(email)}" style="color:#2563EB">${escapeHtml(email)}</a>
              </td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;font-size:13px">Subject</td>
              <td style="padding:8px 0;font-weight:600;color:#111827;font-size:13px">${escapeHtml(subject || '(no subject)')}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;font-size:13px">Submitted</td>
              <td style="padding:8px 0;color:#6b7280;font-size:12px">${submittedAt} IST</td></tr>
        </table>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0"/>
        <p style="color:#6b7280;font-size:12px;margin:0 0 8px;text-transform:uppercase;letter-spacing:.05em">Message</p>
        <div style="background:#f9fafb;border-radius:8px;padding:16px;font-size:14px;line-height:1.6;color:#374151;white-space:pre-wrap">${escapeHtml(message)}</div>
        <p style="margin:24px 0 0;font-size:12px;color:#9ca3af">
          Hit <strong>Reply</strong> to respond directly to <strong>${escapeHtml(name)}</strong> at ${escapeHtml(email)}.
        </p>
      </div>
    </div>
  `;

  const info = await t.sendMail({
    from:    `"AI eBook Creator" <${process.env.EMAIL_USER}>`,
    to:      recipient,
    replyTo: `"${name}" <${email}>`,
    subject: `[eBook Creator Contact] ${subject || 'New message'}`,
    html,
    text: `New contact form submission\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject || '(no subject)'}\nSubmitted: ${submittedAt} IST\n\nMessage:\n${message}`,
  });

  return info;
};

/** Prevent XSS / email header injection */
const escapeHtml = (str) =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    // Prevent email header injection
    .replace(/[\r\n]/g, ' ');

module.exports = { sendContactEmail };
