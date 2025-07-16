const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const validateUser = require("../controllers/validateUser");
const twilio = require("twilio");

const router = express.Router();

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

// ------------------ SIGNUP ------------------
router.post("/signup", async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).json({ msg: error.details[0].message });

  let { userName, number, password, location } = req.body;

  if (typeof number !== "string") number = number.toString();
  if (!number.startsWith("+")) number = "+" + number;

  try {
    const existingUser = await User.findOne({ number });
    if (existingUser) return res.status(400).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      userName,
      number,
      password: password,
      location,
      verified: false,
    });

    await newUser.save();

    await client.verify
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({
        to: number,
        channel: "sms",
      });

    res.status(201).json({ msg: "Signup successful. OTP sent. Use /verify to confirm." });
  } catch (err) {
    res.status(500).json({ msg: "Signup failed", error: err.message });
  }
});

// ------------------ VERIFY ------------------
router.post("/verify", async (req, res) => {
  const { number, code } = req.body;

  try {
    const user = await User.findOne({ number });
    if (!user) return res.status(404).json({ msg: "User not found" });

    const verification_check = await client.verify
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({
        to: number.startsWith("+") ? number : `+${number}`,
        code,
      });

    if (verification_check.status !== "approved") {
      return res.status(400).json({ msg: "Invalid verification code" });
    }

    user.verified = true;
    await user.save();

    const token = jwt.sign({ _id: user._id }, process.env.JWTPRIVATEKEY, {
      expiresIn: "7d",
    });

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({ msg: "User verified successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Verification failed", error: err.message });
  }
});

// ------------------ LOGIN ------------------
router.post("/login", async (req, res) => {
  const { number, password } = req.body;
  try {
    const user = await User.findOne({ number });
    if (!user) return res.status(404).json({ msg: "User not found" });

    if (!user.verified)
      return res.status(403).json({ msg: "Please verify your phone number first" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ msg: "Incorrect password" });

    const token = jwt.sign({ _id: user._id }, process.env.JWTPRIVATEKEY, {
      expiresIn: "7d",
    });

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({ msg: "Login successful" });
  } catch (err) {
    res.status(500).json({ msg: "Login failed", error: err.message });
  }
});

// ------------------ LOGOUT ------------------
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "Lax",
    secure: false,
  });
  return res.status(200).send({ msg: "Logged out successfully" });
});

// ------------------ SEND OTP (Forgot Password) ------------------
router.post("/send-otp", async (req, res) => {
  const { number } = req.body;

  try {
    const user = await User.findOne({ number });
    if (!user) return res.status(404).json({ msg: "User not found" });

    await client.verify
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({
        to: number.startsWith("+") ? number : `+${number}`,
        channel: "sms",
      });

    res.json({ msg: "OTP sent successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Failed to send OTP", error: err.message });
  }
});

// ------------------ VERIFY OTP (Forgot Password) ------------------
router.post("/verify-otp", async (req, res) => {
  const { number, otp } = req.body;

  try {
    const verification = await client.verify
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({
        to: number.startsWith("+") ? number : `+${number}`,
        code: otp,
      });

    if (verification.status === "approved") {
      res.json({ msg: "OTP verified" });
    } else {
      res.status(400).json({ msg: "Invalid OTP" });
    }
  } catch (err) {
    res.status(500).json({ msg: "OTP verification failed", error: err.message });
  }
});

// ------------------ RESET PASSWORD ------------------
router.post("/reset-password", async (req, res) => {
  const { number, newPassword } = req.body;

  try {
    const user = await User.findOne({ number });
    if (!user) return res.status(404).json({ msg: "User not found" });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ msg: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Error resetting password", error: err.message });
  }
});

module.exports = router;
