const { config, transport } = require("../config");
const { generateTokens } = require("../utils/authHandler");
const { generateOtp } = require("../utils/generateOtp");

async function sendVerificationMail(user) {
  const verificationOTP = await generateOtp();
  const verificationLink = `http://localhost:5173/reset-password?token=${user._id}`;

  const mailOptions = {
    from: config.get("userEmail"),
    to: user?.email,
    subject: "Verify your account",
    html: `<div style="font-family: Arial, sans-serif; padding: 40px; color: #333;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 12px; padding: 30px; box-shadow: 0 6px 18px rgba(0,0,0,0.15); text-align: center;">
      
      <!-- Header -->
      <h1 style="color: #6C63FF; font-size: 28px; margin-bottom: 10px;">Welcome to Authly!</h1>
      <p style="font-size: 16px; color: #555; margin-bottom: 20px;">
        Please verify your email using the OTP below.
      </p>
      
      <!-- OTP Box -->
      <div style="font-size: 32px; letter-spacing: 3px; font-weight: bold; color: #333; background: #f4f4f8; padding: 15px; border-radius: 8px; display: inline-block; margin: 20px 0;">
        ${verificationOTP}
      </div>
      
      <!-- Expiry Note -->
      <p style="font-size: 14px; color: #666;">
        This code expires in <strong>10 minutes</strong>. Do not share it with anyone.
      </p>
      
      <!-- Alternative Button -->
      <div style="margin: 25px 0;">
        <a href="${verificationLink}" style="background: #6C63FF; color: #fff; text-decoration: none; padding: 14px 28px; font-size: 16px; border-radius: 6px; display: inline-block;">
          Verify Now
        </a>
      </div>
      
      <!-- Footer -->
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <p style="font-size: 12px; color: #999;">
        If you didn’t request this code, you can safely ignore this email.<br>
        © ${new Date().getFullYear()} Authly. All rights reserved.
      </p>
    </div>
  </div>`,
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
    subject: "Password Reset - Authly",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 40px; color: #333; background-color: #f8f9fa;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 12px; padding: 30px; box-shadow: 0 6px 18px rgba(0,0,0,0.15); text-align: center;">

          <!-- Header -->
          <h1 style="color: #28A745; font-size: 26px; margin-bottom: 10px;">Password Reset Request</h1>

          <!-- Greeting -->
          <p style="font-size: 16px; color: #555; margin-bottom: 10px;">
            Dear ${user.email},
          </p>

          <!-- Message -->
          <p style="font-size: 15px; color: #666; margin-bottom: 20px;">
            We received a request to reset your password. If you initiated this request, please click the button below to create a new password.  
          </p>

          <!-- Reset Password Button -->
          <div style="margin: 25px 0;">
            <a href="${resetPasswordLink}" style="background: #28A745; color: #fff; text-decoration: none; padding: 14px 28px; font-size: 16px; font-weight: bold; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </div>

          <!-- Expiry Note -->
          <p style="font-size: 14px; color: #666;">
            This link is valid for <strong>10 minutes</strong>. If you did not request a password reset, please ignore this email.
          </p>

          <!-- Alternative Link -->
          <p style="font-size: 14px; color: #666; margin-top: 15px;">
            Alternatively, you can copy and paste the following link into your browser:<br>
            <a href="${resetPasswordLink}" style="color: #28A745; word-break: break-word;">
              ${resetPasswordLink}
            </a>
          </p>

          <!-- Footer -->
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="font-size: 12px; color: #999; margin-top: 10px;">
            Thank you for choosing Authly.<br>
            © ${new Date().getFullYear()} Authly. All rights reserved.
          </p>
        </div>
      </div>
    `,
  };

  await transport.sendMail(mailOptions);
  return token;
}

module.exports = { sendVerificationMail, sendForgetPasswordLink };
