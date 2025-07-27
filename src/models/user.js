const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    match: /^[a-zA-Z0-9_]+$/,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  phoneOtp: {
    type: String,
  },
  phoneVerified: {
    type: Boolean,
    default: false,
  },
  refreshToken: {
    type: String,
  },
  otp: {
    type: String,
    max: 6,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
});
module.exports = model("User", userSchema);
