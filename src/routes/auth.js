const express = require("express");
const { AuthCtrl } = require("../controllers");
const { validateRegistrationRules } = require("../middlewares/validation");
const { authenticatedRoutes, authorize } = require("../middlewares/auth");
const loginLimiter = require("../middlewares/loginLimiter");
const router = express.Router();

router.get(
  "/users",
  authenticatedRoutes,
  authorize("admin"),
  AuthCtrl.getAllUser
);
router.get("/user", authenticatedRoutes, AuthCtrl.getUserById);
router.post("/update-profile", authenticatedRoutes, AuthCtrl.updateProfile);
router.post(
  "/update-profile",
  authenticatedRoutes,
  authorize("admin"),
  AuthCtrl.updateUserProfileById
);
router.post("/register", validateRegistrationRules, AuthCtrl.register);
router.post("/login", loginLimiter, AuthCtrl.login);
router.post("/mail-verification", AuthCtrl.verifyMail);
router.post("/forget-password", AuthCtrl.forgetPassword);
router.post("/reset-password", authenticatedRoutes, AuthCtrl.resetPassword);
router.post("/logout", authenticatedRoutes, AuthCtrl.logout);
router.post("/get-phone-otp", AuthCtrl.sendOtp);
router.post("/verify-phone", AuthCtrl.verifyOtp);

module.exports = router;
