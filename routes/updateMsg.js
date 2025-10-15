// routes/updateMsg.js
const express = require("express");
const router = express.Router();
const UpdateMsg = require("../models/Update");

// GET request instead of POST
router.get("/", async (req, res) => {
  try {
    res.json("Fetching updates...");
  } catch (error) {
    console.error("Fetch updates error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
