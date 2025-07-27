require("dotenv").config();

const _config = {
  port: process.env.PORT,
  databaseUrl: process.env.MONGODB_CONNECTION_STRING,
  jwtSecret: process.env.JWT_SECRET,
  smtpUser: process.env.SMTP_USER,
  smtpPasswod: process.env.SMTP_PASSWORD,
  userEmail: process.env.USER_EMAIL,
  twilioSid: process.env.TWILIO_SID,
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
  twilioPhone: process.env.TWILIO_PHONE,
};

const config = {
  get(key) {
    const value = _config[key];
    if (!value) {
      console.log(
        `The ${value} not found, Make sure to pass environment variables`
      );
    }
    return value;
  },
};
module.exports = config;
