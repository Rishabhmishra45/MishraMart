import axios from "axios";

const sendEmail = async ({ email, subject, html }) => {
  try {
    if (!process.env.BREVO_API_KEY) {
      throw new Error("BREVO_API_KEY is missing in environment variables");
    }

    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { name: "MishraMart", email: process.env.EMAIL_USER },
        to: [{ email }],
        subject,
        htmlContent: html,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
          accept: "application/json",
        },
        timeout: 15000, // ✅ 15 sec max
      }
    );

    return true;
  } catch (err) {
    console.error("BREVO EMAIL ERROR:", err?.response?.data || err.message);
    throw new Error("Email sending failed");
  }
};

export default sendEmail;
