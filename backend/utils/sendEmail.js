import { Resend } from "resend";

// Resend email sender (OTP + reset password)
const sendEmail = async ({ email, subject, html }) => {
  try {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      throw new Error("RESEND_API_KEY is missing in environment variables");
    }

    const resend = new Resend(apiKey);

    // Use Resend default sender when custom domain is not available
    const from = process.env.RESEND_FROM || "MishraMart <onboarding@resend.dev>";

    const { data, error } = await resend.emails.send({
      from,
      to: [email],
      subject,
      html,
    });

    if (error) {
      console.error("❌ RESEND EMAIL ERROR:", error);
      throw new Error(error?.message || "Resend email sending failed");
    }

    console.log("✅ Resend Email Sent:", {
      to: email,
      subject,
      id: data?.id,
    });

    return data;
  } catch (err) {
    console.error("❌ SEND EMAIL FAILED:", err.message);
    throw err;
  }
};

export default sendEmail;
