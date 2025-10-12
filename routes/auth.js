const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const validateUser = require("../controllers/validateUser");

const router = express.Router();

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
      password: hashedPassword,
      location,
      verified: false, // Will be updated after Firebase OTP verification
    });

    await newUser.save();

    res.status(201).json({ msg: "Signup successful. Please verify your phone number." });
  } catch (err) {
    res.status(500).json({ msg: "Signup failed", error: err.message });
  }
});

// ------------------ MARK USER VERIFIED ------------------
router.post("/mark-verified", async (req, res) => {
  const { number } = req.body;

  if (!number) return res.status(400).json({ msg: "Phone number is required" });

  try {
    const formattedNumber = number.startsWith("+") ? number : "+" + number;

    const user = await User.findOne({ number: formattedNumber });
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.verified = true;
    await user.save();

    res.json({ msg: "User verified successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Verification update failed", error: err.message });
  }
});

// ------------------ LOGIN ------------------
// ------------------ LOGIN (Plain text password check - NOT SECURE) ------------------
router.post("/login", async (req, res) => {
  const { number, password } = req.body;

  try {
    // normalize number so users can send with or without leading +
    let lookupNumber = number;
    if (typeof lookupNumber !== "string") lookupNumber = lookupNumber.toString();
    if (!lookupNumber.startsWith("+")) lookupNumber = "+" + lookupNumber;

    const user = await User.findOne({ number: lookupNumber });
    if (!user) return res.status(404).json({ msg: "User not found" });

    // ✅ Removed this verification check:
    // if (!user.verified)
    //   return res.status(403).json({ msg: "Please verify your phone number first" });

    // Compare provided password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ msg: "Incorrect password" });

    const token = jwt.sign({ _id: user._id }, process.env.JWTPRIVATEKEY, {
      expiresIn: "7d",
    });

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "None",
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
    sameSite: "None",
    secure: process.env.NODE_ENV === "production",
  });
  return res.status(200).send({ msg: "Logged out successfully" });
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
