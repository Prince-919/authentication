const twilio = require("twilio");
const { generateOtp } = require("../utils/generateOtp");
const { config } = require("../config");

const client = new twilio(
  config.get("twilioSid"),
  config.get("twilioAuthToken")
);

async function sendOtpVerification(phone) {
  const verificationOtp = await generateOtp();
  await client.messages.create({
    body: `Use ${verificationOtp} to verify your login. This code expires in 1 minutes. If you didn’t request this, ignore this message.
`,
    from: config.get("twilioPhone"),
    to: phone,
  });
  return verificationOtp;
}
module.exports = { sendOtpVerification };
