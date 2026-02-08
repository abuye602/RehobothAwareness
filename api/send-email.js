const nodemailer = require("nodemailer");

function isValidEmail(email) {
  // simple + reliable-enough validator
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  try {
    // Handle cases where req.body might be a string
    const body =
      typeof req.body === "string"
        ? JSON.parse(req.body || "{}")
        : req.body || {};

    let { firstName, lastName, email, message } = body;

    // Normalize (trim) everything
    firstName = (firstName || "").trim();
    lastName = (lastName || "").trim();
    email = (email || "").trim();
    message = (message || "").trim();

    // Validate required fields AFTER trimming
    if (!firstName || !lastName || !email || !message) {
      return res.status(400).send("Missing required fields");
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).send("Invalid email address");
    }

    // Optional: limit message size (prevents abuse)
    if (message.length > 5000) {
      return res.status(400).send("Message too long");
    }

    if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
      return res.status(500).send("Email service not configured");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const toEmail = process.env.MAIL_TO || process.env.MAIL_USER;

    await transporter.sendMail({
      from: `"Rehoboth Website" <${process.env.MAIL_USER}>`,
      to: toEmail,
      replyTo: email, // user’s email (validated)
      subject: `New Contact Form Message - ${firstName} ${lastName}`,
      text: `Name: ${firstName} ${lastName}\nEmail: ${email}\n\nMessage:\n${message}`,
    });

    return res.status(200).send("OK");
  } catch (err) {
    console.error("SEND EMAIL ERROR:", err);
    return res.status(500).send("Failed to send email");
  }
};
