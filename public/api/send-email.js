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
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: MAIL_USER, pass: MAIL_PASS },
    });

    // 1) Email to you (admin)
    await transporter.sendMail({
      from: `"Rehoboth Website" <${MAIL_USER}>`,
      to: MAIL_TO,
      replyTo: `${firstName} ${lastName} <${email}>`,
      subject: `Contact Form Submission from ${firstName} ${lastName}`,
      html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd;">
      <h2 style="color: #088178; text-align: center;">New Contact Form Submission</h2>
      <p style="font-size: 16px; color: #333;">You have received a new message from your contact form:</p>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9;"><strong>First Name:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${firstName}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9;"><strong>Last Name:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${lastName}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9;"><strong>Email:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${email}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9;"><strong>Message:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${message}</td>
        </tr>
      </table>
      <p style="font-size: 14px; color: #555; text-align: center; margin-top: 20px;">
        This email was sent from your website's contact form.
      </p>
    </div>`,
    });

    // 2) Confirmation email to user
    await transporter.sendMail({
      from: `"Rehoboth Awareness Network" <${MAIL_USER}>`,
      to: email,
      subject: "We received your message!",
      html: `
       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #ddd;">
        <h2 style="text-align:center; color:#088178;">Message Received!</h2>
  
        <p>Hi <strong>${firstName}</strong>,</p>
  
        <p>
          Thank you for contacting <strong>Rehoboth Awareness Network</strong>.
          This email confirms that we’ve successfully received your message.
        </p>
  
        <hr style="margin: 20px 0;" />
  
        <h3 style="margin-bottom: 8px;">📩 Your message details</h3>
  
        <p style="margin: 4px 0;"><strong>Submitted on:</strong> ${submittedAt}</p>
        <p style="margin: 4px 0;"><strong>Email:</strong> ${email}</p>
  
        <div style="margin-top: 12px; padding: 14px; background:#f7f7f7; border-radius: 8px;">
          <p style="margin:0 0 6px 0;"><strong>Your message:</strong></p>
          <p style="white-space: pre-wrap; margin:0;">${message}</p>
        </div>
  
        <hr style="margin: 20px 0;" />
  
        <p>
          Our team typically responds within <strong>1–2 business days</strong>.
          If your message is urgent, you may reply directly to this email.
        </p>
  
        <p style="font-size: 14px; color:#555;">
          If you did not submit this message, you can safely ignore this email.
        </p>
  
        <p style="margin-top: 24px;">
          — <br />
          <strong>Rehoboth Awareness Network</strong>
        </p>
        <p>
          Visit our website: 
          <a href="https://rehobothawareness.org">rehobothawareness.org</a>
        </p>
        <p style="font-size:12px;color:#777;text-align:center;">
        This email was sent automatically from our website contact form.
        </p>
      </div>
      `,
      text: `
      Hi ${firstName},

      Thank you for contacting Rehoboth Awareness Network.
      This email confirms that we’ve received your message.
  
      Submitted on: ${submittedAt}
      Email: ${email}
  
      Your message:
      ${message}
      
      We typically respond within 1–2 business days.
      If your message is urgent, you may reply directly to this email.
  
    — Rehoboth Awareness Network
  
  `,
    });

    return res.status(200).send("Email sent successfully");
  } catch (err) {
    console.error("send-email error:", err);
    return res.status(500).send(err.message || "Failed to send email");
  }
};
