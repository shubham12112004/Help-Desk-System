const User = require("../models/User");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const OTP_EXPIRY_MINUTES = 10;

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function normalizePhone(phone) {
  if (!phone || typeof phone !== "string") return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return "+91" + digits; // India
  if (digits.length === 12 && digits.startsWith("91")) return "+" + digits;
  if (digits.length >= 10) return "+" + digits;
  return null;
}

async function sendVerificationEmail(email, name, verificationUrl, otp) {
  const user = process.env.EMAIL_USER && process.env.EMAIL_USER.trim();
  const pass = process.env.EMAIL_PASS && process.env.EMAIL_PASS.trim();

  if (!user || !pass) return false;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });

  const fromName = process.env.EMAIL_FROM_NAME || "Help Desk";

  const text = `Welcome to Help Desk!

Verify your email:
1. Click this link: ${verificationUrl}
2. Or use this OTP: ${otp} (valid ${OTP_EXPIRY_MINUTES} minutes)

If you didn't create an account, ignore this email.`;

  const html = `
    <div style="font-family: sans-serif; max-width: 480px;">
      <h2 style="color: #334155;">Verify your email</h2>
      <p>Hi ${name},</p>
      <p>Thanks for signing up. Verify using either option below:</p>
      <p>
        <a href="${verificationUrl}" style="display: inline-block; background: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px;">
          Verify with link
        </a>
      </p>
      <p style="color: #334155; font-size: 16px;">
        Or use this OTP: <strong>${otp}</strong>
      </p>
      <p style="color: #64748b; font-size: 12px;">
        OTP is valid for ${OTP_EXPIRY_MINUTES} minutes.
      </p>
      <p style="color: #64748b; font-size: 12px;">
        If you didn't create an account, ignore this email.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"${fromName}" <${user}>`,
    to: email.trim(),
    subject: "Verify your email – Help Desk (OTP inside)",
    text,
    html,
  });

  return true;
}

async function sendSmsOtp(phone, otp) {
  if (
    !process.env.TWILIO_ACCOUNT_SID ||
    !process.env.TWILIO_AUTH_TOKEN ||
    !process.env.TWILIO_PHONE_NUMBER
  )
    return false;

  try {
    const client = require("twilio")(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    await client.messages.create({
      body: `Your Help Desk verification code is ${otp}. Valid for ${OTP_EXPIRY_MINUTES} minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });

    return true;
  } catch (err) {
    console.error("SMS send failed:", err.message);
    return false;
  }
}

// REGISTER USER
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      return res.status(400).json({
        message:
          "This email is already registered. Please sign in or use a different email.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const otp = generateOtp();
    const otpExpiresAt = new Date(
      Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000
    );

    const normalizedPhone = normalizePhone(phone) || null;

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: role || "user",
      phone: normalizedPhone,
      isVerified: false,
      verificationToken,
      otp,
      otpExpiresAt,
    });

    const verificationUrl = `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }/verify-email/${verificationToken}`;

    const hasEmailConfig = !!(
      process.env.EMAIL_USER && process.env.EMAIL_PASS
    );

    console.log(
      "[Register] Email config:",
      hasEmailConfig ? process.env.EMAIL_USER : "MISSING"
    );

    if (hasEmailConfig) {
      try {
        await sendVerificationEmail(email, name, verificationUrl, otp);
        console.log(`[OK] Verification email sent to ${email}`);
      } catch (mailErr) {
        console.error("[FAIL] Email send error:", mailErr.message);
      }
    } else {
      console.log(
        `[No SMTP] Add EMAIL_USER and EMAIL_PASS to Backend/.env. Link: ${verificationUrl} | OTP: ${otp}`
      );
    }

    if (normalizedPhone) {
      const smsSent = await sendSmsOtp(normalizedPhone, otp);
      if (smsSent) console.log(`Verification SMS sent to ${normalizedPhone}`);
      else console.log(`[No Twilio] SMS not sent. OTP: ${otp}`);
    }

    res.status(201).json({
      message:
        "Registered! Check your email (and phone if provided) for the verification link or OTP.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
      verificationUrl,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// VERIFY EMAIL (by link)
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired verification token" });
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.otp = null;
    user.otpExpiresAt = null;

    await user.save();

    res
      .status(200)
      .json({ message: "Email verified successfully! You can now log in." });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// VERIFY BY OTP
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(400).json({ message: "No account found with this email" });
    }

    if (user.isVerified) {
      return res
        .status(400)
        .json({ message: "Account is already verified. You can log in." });
    }

    if (user.otp !== String(otp).trim()) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (!user.otpExpiresAt || new Date() > user.otpExpiresAt) {
      return res
        .status(400)
        .json({ message: "OTP has expired. Please request a new one." });
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.otp = null;
    user.otpExpiresAt = null;

    await user.save();

    res
      .status(200)
      .json({ message: "Email verified successfully! You can now log in." });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// RESEND OTP
const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(400).json({ message: "No account found with this email" });
    }

    if (user.isVerified) {
      return res
        .status(400)
        .json({ message: "Account is already verified. You can log in." });
    }

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await user.save();

    const verificationUrl = `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }/verify-email/${user.verificationToken}`;

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        await sendVerificationEmail(user.email, user.name, verificationUrl, otp);
        console.log(`Resend: verification email sent to ${user.email}`);
      } catch (e) {
        console.error("Resend email failed:", e.message);
      }
    }

    if (user.phone) {
      await sendSmsOtp(user.phone, otp);
    }

    res.status(200).json({
      message: "New verification OTP/link sent successfully.",
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// LOGIN USER
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    if (!user.isVerified) {
      return res
        .status(400)
        .json({ message: "Please verify your email before logging in" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "defaultsecret",
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// TEST EMAIL
const testEmail = async (req, res) => {
  const user = process.env.EMAIL_USER && process.env.EMAIL_USER.trim();
  const pass = process.env.EMAIL_PASS && process.env.EMAIL_PASS.trim();

  if (!user || !pass) {
    return res.status(500).json({
      ok: false,
      error: "EMAIL_USER or EMAIL_PASS missing in .env",
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass,
      },
    });

    await transporter.verify();

    const to = req.query.to || user;

    await transporter.sendMail({
      from: `"Help Desk Test" <${user}>`,
      to,
      subject: "Help Desk – test email",
      text: "If you got this, email is working.",
    });

    return res.json({ ok: true, message: "Test email sent to " + to });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err.message,
      code: err.code,
    });
  }
};

module.exports = {
  registerUser,
  verifyEmail,
  verifyOtp,
  resendOtp,
  loginUser,
  testEmail,
};