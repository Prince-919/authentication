const nodemailer = require("nodemailer");
const config = require("./config");

const transport = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: config.get("smtpUser"),
    pass: config.get("smtpPasswod"),
  },
});

module.exports = transport;
