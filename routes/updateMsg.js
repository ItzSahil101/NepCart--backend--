const express = require("express");
const router = express.Router();
const UpdateMsg = require("../models/Update");


router.post("/fetch", async (req, res) => {
  try {
    const updates = await UpdateMsg.find();
    res.json(updates);
  } catch (error) {
    console.error("Fetch updates error:", error);
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
