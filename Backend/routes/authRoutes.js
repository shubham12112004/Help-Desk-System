const express = require("express");
const { registerUser, verifyEmail, verifyOtp, resendOtp, loginUser, testEmail } = require("../controllers/authController.js");

const router = express.Router();

router.get("/test-email", testEmail);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/verify-email/:token", verifyEmail);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);

module.exports = router;
