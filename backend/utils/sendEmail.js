import nodemailer from "nodemailer";

const sendEmail = async ({ email, subject, html }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"MishraMart" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html, // 👈 HTML EMAIL
  });
};

export default sendEmail;
