const { config, transport } = require("../config");
const { generateTokens } = require("../utils/authHandler");
const { generateOtp } = require("../utils/generateOtp");

async function sendVerificationMail(user) {
  const verificationOTP = await generateOtp();
  const verificationLink = `http://localhost:5173/verify-otp?userId=${user._id}`;

  const mailOptions = {
    from: config.get("userEmail"),
    to: user?.email,
    subject: "Verify your account",
    html: `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0fdf4; padding: 40px;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); text-align: center;">
      <div style="margin-bottom: 20px;">
        <img src="https://img.icons8.com/fluency/96/verified-account.png" alt="Verify Icon" style="height: 60px;" />
      </div>
      <h2 style="color: #28a745; font-size: 24px; margin-bottom: 12px;">
        Verify Your Email Address
      </h2>
      <p style="font-size: 16px; color: #444; margin-bottom: 20px;">
        Hello <strong>${user.email}</strong>,<br />
        Please use the OTP below or click the button to verify your email.
      </p>
      <div style="margin: 30px 0;">
        <div style="display: inline-block; background-color: #e9fbe7; border: 2px dashed #28a745; color: #28a745; font-size: 28px; font-weight: bold; padding: 18px 32px; letter-spacing: 8px; border-radius: 10px;">
          ${verificationOTP}
        </div>
      </div>
      <div style="margin: 30px 0;">
        <a href="${verificationLink}" style="background: #28a745; color: #fff; text-decoration: none; padding: 14px 28px; font-size: 16px; font-weight: bold; border-radius: 6px; display: inline-block;">
          Verify Now
        </a>
      </div>
      <p style="font-size: 14px; color: #666;">
        This OTP is valid for <strong>60 minutes</strong>.<br />
        If you didn’t request this, you can safely ignore this email.
      </p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;" />
      <p style="font-size: 12px; color: #999;">
        Need help? Contact us at <a href="mailto:support@trueauth.com" style="color: #28a745;">support@trueauth.com</a><br />
        &copy; ${new Date().getFullYear()} TrueAuth. All rights reserved.
      </p>
    </div>
  </div>
`,
  };
  await transport.sendMail(mailOptions);
  return verificationOTP;
}
async function sendForgetPasswordLink(user) {
  const { token } = await generateTokens(user);
  const resetPasswordLink = `http://localhost:5173/reset-password?token=${token}`;

  const mailOptions = {
    from: config.get("userEmail"),
    to: user?.email,
    subject: "Password Reset - TrueAuth",
    html: `
       <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0fdf4; padding: 40px;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); text-align: center;">
      <div style="margin-bottom: 20px;">
        <img src="https://cdn-icons-png.flaticon.com/512/6146/6146587.png" alt="Reset Icon" style="height: 60px;" />
      </div>
      <h2 style="color: #28a745; font-size: 24px; margin-bottom: 12px;">
        Password Reset Request
      </h2>
      <p style="font-size: 16px; color: #444; margin-bottom: 20px;">
        Hello <strong>${user.email}</strong>,<br />
        We received a request to reset your password. If you made this request, you can create a new password below.
      </p>
      <div style="margin: 30px 0;">
        <a href="${resetPasswordLink}" style="background: #28a745; color: #fff; text-decoration: none; padding: 14px 28px; font-size: 16px; font-weight: bold; border-radius: 6px; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p style="font-size: 14px; color: #666;">
        This link is valid for <strong>60 minutes</strong>. If you didn’t request this, you can safely ignore this email.
      </p>
      <p style="font-size: 14px; color: #666; margin-top: 20px;">
        Or copy and paste this link into your browser:<br />
        <a href="${resetPasswordLink}" style="color: #28a745; word-break: break-word;">
          ${resetPasswordLink}
        </a>
      </p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;" />
      <p style="font-size: 12px; color: #999;">
        Need help? Contact us at <a href="mailto:support@authly.com" style="color: #28a745;">trueauth@authly.com</a><br />
        &copy; ${new Date().getFullYear()} TrueAuth. All rights reserved.
      </p>
    </div>
  </div>
    `,
  };

  await transport.sendMail(mailOptions);
  return token;
}

module.exports = { sendVerificationMail, sendForgetPasswordLink };
