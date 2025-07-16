const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const JWT_SECRET = process.env.JWTPRIVATEKEY;

router.get("/cookie", async (req, res) => {
  const token = req.cookies.token; 
  // console.log("All cookies:", req.cookies);
  // console.log("Token from cookie:", token);

  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // ✅ FIX: use "_id", not "id"
    const userId = decoded._id;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user); // ✅ return user to frontend
  } catch (error) {
    console.error("JWT verification error:", error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
});

module.exports = router;
