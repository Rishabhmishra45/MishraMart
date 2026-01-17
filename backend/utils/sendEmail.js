import nodemailer from "nodemailer";

const sendEmail = async ({ email, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // ✅ 465 = secure true
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // ✅ Gmail App Password
    },
  });

  // ✅ optional but very useful (debug)
  await transporter.verify();

  await transporter.sendMail({
    from: `MishraMart <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html,
  });
};

export default sendEmail;
