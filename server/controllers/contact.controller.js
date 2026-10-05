const { sendContactEmail } = require('../utils/mailer');

// Allowed subject max length to prevent abuse
const MAX_LENGTH = { name: 100, email: 254, subject: 200, message: 5000 };

// Simple email format check
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// @desc  Submit contact form — sends email to support inbox
// @route POST /api/contact
const submitContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // ── Server-side validation ────────────────────────
    const errors = [];

    if (!name?.trim())                             errors.push('Name is required.');
    if (!email?.trim())                            errors.push('Email is required.');
    else if (!isValidEmail(email.trim()))          errors.push('Please enter a valid email address.');
    if (!message?.trim())                          errors.push('Message is required.');
    if (name?.length    > MAX_LENGTH.name)         errors.push(`Name must be under ${MAX_LENGTH.name} characters.`);
    if (email?.length   > MAX_LENGTH.email)        errors.push('Email address is too long.');
    if (subject?.length > MAX_LENGTH.subject)      errors.push(`Subject must be under ${MAX_LENGTH.subject} characters.`);
    if (message?.length > MAX_LENGTH.message)      errors.push(`Message must be under ${MAX_LENGTH.message} characters.`);

    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors[0], errors });
    }

    // ── Send email ────────────────────────────────────
    await sendContactEmail({
      name:    name.trim(),
      email:   email.trim().toLowerCase(),
      subject: subject?.trim() || '',
      message: message.trim(),
    });

    return res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully. Our support team will get back to you within 24 hours.',
    });

  } catch (error) {
    console.error('[Contact] Email send failed:', error.message);

    // Don't leak internal errors to the client
    const isConfigError = error.message?.includes('Email not configured') ||
                          error.message?.includes('App Password');

    return res.status(500).json({
      success: false,
      message: isConfigError
        ? 'Contact form is temporarily unavailable. Please email us directly at supportebookcreator@gmail.com.'
        : 'Failed to send your message. Please try again or email us at supportebookcreator@gmail.com.',
    });
  }
};

module.exports = { submitContact };
