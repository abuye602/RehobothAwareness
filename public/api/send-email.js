const nodemailer = require("nodemailer");

module.exports = async (req, res) => {
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  try {
    const body =
      typeof req.body === "string"
        ? JSON.parse(req.body || "{}")
        : req.body || {};

    const { firstName, lastName, email, message } = body;

    if (!firstName || !lastName || !email || !message) {
      return res.status(400).send("Missing required fields");
    }

    // Use the SAME env var names everywhere (pick one system)
    const MAIL_USER = process.env.MAIL_USER;
    const MAIL_PASS = process.env.MAIL_PASS;
    const MAIL_TO = process.env.MAIL_TO || MAIL_USER;

    if (!MAIL_USER || !MAIL_PASS) {
      return res.status(500).send("Server mail env vars not set");
    }

    const submittedAt = new Date().toLocaleString();
    const refId = `RAN-${Date.now()}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: MAIL_USER, pass: MAIL_PASS },
    });

    // 1) Email to you (admin)
    await transporter.sendMail({
      from: `"Rehoboth Website" <${MAIL_USER}>`,
      to: MAIL_TO,
      replyTo: `${firstName} ${lastName} <${email}>`,
      subject: `Contact Form Submission from ${firstName} ${lastName} (${refId})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin:auto; padding: 20px; border: 1px solid #ddd;">
          <h2 style="color:#088178; text-align:center;">New Contact Form Submission</h2>
          <p><strong>Submitted:</strong> ${submittedAt}</p>
          <p><strong>Ref ID:</strong> ${refId}</p>
          <p><strong>Name:</strong> ${firstName} ${lastName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <hr />
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
      `,
      text: `Submitted: ${submittedAt}\nRef: ${refId}\nName: ${firstName} ${lastName}\nEmail: ${email}\n\n${message}`,
    });

    // 2) Confirmation email to user
    await transporter.sendMail({
      from: `"Rehoboth Awareness Network" <${MAIL_USER}>`,
      to: email,
      subject: "We received your message!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin:auto; padding: 24px; border: 1px solid #ddd;">
          <h2 style="text-align:center; color:#088178;">Message Received!</h2>
          <p>Hi <strong>${firstName}</strong>,</p>
          <p>Thanks for contacting <strong>Rehoboth Awareness Network</strong>. We received your message.</p>
          <p><strong>Submitted:</strong> ${submittedAt}</p>
          <p><strong>Ref ID:</strong> ${refId}</p>
          <div style="margin-top: 12px; padding: 14px; background:#f7f7f7; border-radius: 8px;">
            <p style="margin:0 0 6px 0;"><strong>Your message:</strong></p>
            <p style="white-space: pre-wrap; margin:0;">${message}</p>
          </div>
          <p style="margin-top: 18px;">We typically respond within <strong>1–2 business days</strong>.</p>
          <p style="font-size:12px;color:#777;text-align:center;">This email was sent automatically from our website contact form.</p>
        </div>
      `,
      text: `Hi ${firstName},\n\nWe received your message and will respond soon.\nSubmitted: ${submittedAt}\nRef: ${refId}\n\nYour message:\n${message}\n\n— Rehoboth Awareness Network`,
    });

    return res.status(200).send("Email sent successfully");
  } catch (err) {
    console.error("send-email error:", err);
    return res.status(500).send(err.message || "Failed to send email");
  }
};
