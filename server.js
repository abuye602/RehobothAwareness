const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();

// Middleware to parse incoming form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const options = { index: "./index.html" };

// Serve static files (HTML, CSS, etc.)
app.use(express.static("public"));
app.use(express.static("pages"));

// Email sending route
app.post("/send-email", async (req, res) => {
  console.log("✅ /send-email hit");
  console.log("BODY:", req.body);

  const { firstName, lastName, email, message } = req.body;

  if (!firstName || !lastName || !email || !message) {
    return res.status(400).send("Missing required fields");
  }

  // ✅ define these BEFORE using them in templates
  const submittedAt = new Date().toLocaleString();
  const refId = `RAN-${Date.now()}`;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      logger: true,
      debug: true,
    });

    // optional for debugging
    await transporter.verify();

    const adminMail = {
      from: `"Rehoboth Website" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Where you want to receive emails
      replyTo: `${firstName} ${lastName} <${email}>`, // ✅ when you hit Reply, it goes to the user
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
    </div>
  `,
      text: `Message from ${firstName} ${lastName} (${email}):\n\n${message}`, // Include user's email in the body
    };

    const userConfirmationMail = {
      from: `"Rehoboth Awareness Network" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "We received your message!",
      text: `Hi ${firstName},\n\nWe received your message and will respond soon.\n\nYour message:\n${message}\n\n— Rehoboth Awareness Network`,
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
    };

    const adminInfo = await transporter.sendMail(adminMail);
    console.log("✅ Admin email sent:", adminInfo.messageId);

    const userInfo = await transporter.sendMail(userConfirmationMail);
    console.log("✅ User confirmation sent:", userInfo.messageId);

    return res.status(200).send("Email sent successfully");
  } catch (error) {
    console.error("EMAIL ERROR:", error);
    return res.status(500).send(error.message || "Failed to send email");
  }
});

// Start the server
const server = app.listen(3000, () => {
  var port = server.address().port;

  console.log("Successfully running at http://localhost:%s", port);
});
