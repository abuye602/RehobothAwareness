const nodemailer = require("nodemailer");

module.exports = async (req, res) => {
  // Allow only POST
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  try {
    // Vercel usually parses JSON for you, but this makes it bulletproof:
    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};

    const { firstName, lastName, email, message } = body;

    if (!firstName || !lastName || !email || !message) {
      return res.status(400).send("Missing required fields");
    }

    if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
      return res.status(500).send("Missing server email config");
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
      replyTo: email,
      subject: `New Contact Form Message - ${firstName} ${lastName}`,
      text: `Name: ${firstName} ${lastName}\nEmail: ${email}\n\nMessage:\n${message}`,
    });

    return res.status(200).send("OK");
  } catch (err) {
    console.error(err);
    return res.status(500).send("Failed to send email");
  }
};
