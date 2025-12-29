const otpEmailTemplate = (otp) => {
  return `
  <div style="background:#f4f6f8;padding:30px;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:480px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.08)">
      
      <!-- Header -->
      <div style="background:linear-gradient(135deg,#0f2027,#203a43,#2c5364);padding:20px;text-align:center;color:white">
        <h1 style="margin:0;font-size:22px;letter-spacing:0.5px;">MishraMart</h1>
        <p style="margin:5px 0 0;font-size:13px;opacity:0.9;">
          Secure Password Reset
        </p>
      </div>

      <!-- Body -->
      <div style="padding:25px;color:#333;">
        <p style="font-size:15px;margin-bottom:12px;">
          Hello 👋
        </p>

        <p style="font-size:14px;line-height:1.6;margin-bottom:20px;">
          We received a request to reset your <b>MishraMart</b> account password.
          Please use the OTP below to continue.
        </p>

        <!-- OTP BOX -->
        <div style="text-align:center;margin:25px 0;">
          <div style="
            display:inline-block;
            background:#f1f5f9;
            padding:15px 30px;
            font-size:26px;
            font-weight:bold;
            letter-spacing:6px;
            color:#0f2027;
            border-radius:8px;
            border:1px dashed #4aa4b5;
          ">
            ${otp}
          </div>
        </div>

        <p style="font-size:13px;color:#555;text-align:center;margin-bottom:20px;">
          This OTP is valid for <b>10 minutes</b>.
        </p>

        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />

        <p style="font-size:12px;color:#777;line-height:1.5;">
          ⚠️ <b>Security Notice:</b><br/>
          • Do not share this OTP with anyone.<br/>
          • MishraMart team will never ask for your OTP.
        </p>
      </div>

      <!-- Footer -->
      <div style="background:#f9fafb;padding:12px;text-align:center;font-size:11px;color:#888;">
        © ${new Date().getFullYear()} MishraMart. All rights reserved.
      </div>
    </div>
  </div>
  `;
};

export default otpEmailTemplate;
