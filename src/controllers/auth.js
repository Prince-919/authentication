const { User } = require("../models");
const {
  findUser,
  createUserOrUpdate,
  findAllUser,
} = require("../services/auth");
const {
  sendVerificationMail,
  sendForgetPasswordLink,
} = require("../services/mail");
const { sendOtpVerification } = require("../services/sms");
const {
  generateTokens,
  generatedDecodedToken,
} = require("../utils/authHandler");
const ErrorHandler = require("../utils/errorHandler");
const { generateOtp } = require("../utils/generateOtp");
const { isFieldErrorFree } = require("../utils/isFieldErrorFree");
const { hashPassword, comparePassword } = require("../utils/password");

class AuthCtrl {
  static getAllUser = async (req, res, next) => {
    try {
      const users = await findAllUser({});
      res.status(200).json({
        message: "User fecthed successful.",
        data: users,
      });
    } catch (error) {
      next(error);
    }
  };
  static getUserById = async (req, res, next) => {
    const userId = req.user.id;
    try {
      const user = await findUser({ id: userId }, [
        "-password",
        "-otp",
        "-refreshToken",
        "-__v",
      ]);
      if (!user) {
        throw new ErrorHandler("User with id not found.", 404);
      }
      res.status(200).json({
        message: "User fecthed successful.",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };
  static register = async (req, res, next) => {
    // data sanitation against site script XSS and validate
    await isFieldErrorFree(req, res);
    const { username, email, password, role, phone } = req.body;
    try {
      const userExist = await findUser({ email, username, phone });
      if (userExist) {
        throw new ErrorHandler(
          "User with email or username is already exist.",
          401
        );
      }
      const hashedPassword = await hashPassword(password);
      const savedData = await createUserOrUpdate({
        username,
        email,
        password: hashedPassword,
        role,
        phone,
      });
      const verificationOTP = await sendVerificationMail(savedData);
      const updatedData = await createUserOrUpdate(
        { otp: verificationOTP },
        savedData
      );
      res.status(201).json({
        success: true,
        message: "User registered successful.",
        data: updatedData,
      });
    } catch (error) {
      next(error);
    }
  };
  static login = async (req, res, next) => {
    const { username, email, password } = req.body;
    try {
      const user = await findUser({ email, username });
      if (!user) {
        throw new ErrorHandler("Invalid username or email.", 401);
      }
      const isMatch = await comparePassword(password, user.password);
      if (!isMatch) {
        throw new ErrorHandler("Invalid username or password.", 401);
      }
      const { token, refreshToken } = await generateTokens(user);

      const updatedData = await createUserOrUpdate(
        { refreshToken: refreshToken },
        user
      );

      res.cookie("accessToken", token, {
        httpOnly: true,
        secure: true,
      });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
      });

      res.status(201).json({
        success: true,
        data: updatedData,
        accessToken: token,
        refreshToken: refreshToken,
      });
    } catch (error) {
      next(error);
    }
  };
  static refreshToken = async (req, res, next) => {
    const refresh_token = req.cookies.refreshToken || req.body.refreshToken;
    if (!refresh_token) {
      throw new ErrorHandler("Refresh token not found.", 401);
    }
    try {
      const { err, decoded } = await generatedDecodedToken(refresh_token);
      if (Boolean(err)) {
        throw new ErrorHandler("Invalid token.", 401);
      }
      const user = await User.findById(decoded?.data?.id);
      if (!user) {
        throw new ErrorHandler("User not found.", 404);
      }
      if (user?.refreshToken !== refresh_token) {
        throw new ErrorHandler("Refresh token is not valid.", 401);
      }
      const { token: accessToken } = await generateTokens(user);

      const cookieOptions = {
        httpOnly: true,
        secure: true,
      };
      // clear existing cookies
      res.clearCookie("accessToken", cookieOptions);

      // set new cookies
      res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .json({ message: "Access token generated.", accessToken });
    } catch (error) {
      next(error);
    }
  };
  static verifyMail = async (req, res, next) => {
    // await isFieldErrorFree(req, res);
    const { otp, userId } = req.body;
    try {
      const user = await findUser({ id: userId });
      if (!user) {
        throw new ErrorHandler("User with this id not found.", 404);
      }
      if (user.otp !== otp) {
        throw new ErrorHandler("Invalid OTP.", 401);
      }
      const response = await createUserOrUpdate({ emailVerified: true }, user);
      res.status(200).json({
        message: "Email verified successfully.",
        response,
      });
    } catch (error) {
      next(error);
    }
  };
  static forgetPassword = async (req, res, next) => {
    const { email } = req.body;
    try {
      const user = await findUser({ email });
      if (!user) {
        throw new ErrorHandler("Invalid username or email.", 401);
      }
      const token = await sendForgetPasswordLink(user);
      res.status(201).json({
        success: true,
        message: "Password reset link sent to your email.",
        token,
      });
    } catch (error) {
      next(error);
    }
  };
  static resetPassword = async (req, res, next) => {
    const userId = req.user?.id;
    const { password } = req.body;
    try {
      const user = await findUser({ id: userId }, [
        "-password",
        "-otp",
        "-refreshToken",
        "-__v",
      ]);
      if (!user) {
        throw new ErrorHandler("User with id not found.", 404);
      }
      const hashedPassword = await hashPassword(password);
      const updatedData = await createUserOrUpdate(
        { password: hashedPassword },
        user
      );
      res.status(200).json({
        message: "Password reset successful.",
        data: updatedData,
      });
    } catch (error) {
      next(error);
    }
  };
  static logout = async (req, res, next) => {
    const { userId } = req.user?.id;
    try {
      const user = await findUser({ id: userId });
      if (!user) {
        throw new ErrorHandler("User with id not found.", 404);
      }
      res.clearCookie("accessToken", {
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
      });
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
      });
      res.status(200).json({
        success: true,
        message: "Logout successful.",
      });
    } catch (error) {
      next(error);
    }
  };
  // Phone number
  static sendOtp = async (req, res, next) => {
    const { phone } = req.body;

    try {
      const user = await findUser({ phone });
      if (!user) {
        throw new ErrorHandler(
          "User not found. Please check the phone number and try again.",
          404
        );
      }
      const verificationOTP = await sendOtpVerification(phone);
      const updatedData = await createUserOrUpdate(
        { phoneOtp: verificationOTP },
        user
      );
      res.status(201).json({
        message: "Message sent successful.",
        otp: verificationOTP,
        data: updatedData,
      });
    } catch (error) {
      next(error);
    }
  };
  static verifyOtp = async (req, res, next) => {
    const { phone, otp } = req.body;
    try {
      const user = await findUser({ phone });
      if (!user || user.phoneOtp !== otp) {
        throw new ErrorHandler("Invalid OTP.", 404);
      }
      const updatedData = await createUserOrUpdate(
        { phoneVerified: true },
        user
      );
      res.status(201).json({
        message: "Phone number verified successful.",
        data: updatedData,
      });
    } catch (error) {
      next(error);
    }
  };
}
module.exports = AuthCtrl;
