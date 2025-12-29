import nodemailer from "nodemailer";

const sendEmail = async ({ email, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 20000, // ⬅️ 20 sec
    greetingTimeout: 20000,
    socketTimeout: 20000,
  });

  await transporter.sendMail({
    from: `"MishraMart" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html,
  });
};

export default sendEmail;
