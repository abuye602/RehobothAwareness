const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const { config } = require("dotenv");
require("dotenv"), config();

const app = express();

// Middleware to parse incoming form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const options = { index: "./index.html" };

// Serve static files (HTML, CSS, etc.)
app.use(express.static("public"));
app.use(express.static("pages"));

// Email sending route
app.post("/send-email", (req, res) => {
  const { firstName, lastName, email, message } = req.body;
  console.log(``);

  // Set up Nodemailer
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    logger: true,
    debug: true,
  });

  // Email options
  const mailOptions = {
    from: `"Rehoboth Inc." <your-company-email@example.com>`,
    replyTo: email, // Set reply-to to the user's email
    to: process.env.EMAIL_USER, // Where you want to receive emails
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

  // Send the email
  transporter.sendMail(mailOptions, (error) => {
    if (error) {
      console.log(error);
      return res.status(500).send("Failed to send email");
    }
    res.status(200).send("Email sent successfully");
  });
});

// Start the server
const server = app.listen(3000, () => {
  var port = server.address().port;

  console.log("listening at http://localhost:%s", port);
});
