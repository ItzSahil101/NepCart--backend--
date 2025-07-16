const express = require("express");
const router = express.Router();
const CustomOrder = require("../models/CustomOrder");

// POST new custom order
router.post("/", async (req, res) => {
  try {
    const { userId, imageUrl, tshirtColor, totalPrice, location } = req.body;
    const order = await CustomOrder.create({
      userId,
      imageUrl,
      tshirtColor,
      totalPrice,
      location,
      cancelTimeLeft: 3600,
    });
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all custom orders by user
router.get("/custom-orders/user/:userId", async (req, res) => {
  try {
    const orders = await CustomOrder.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id/cancel", async (req, res) => {
  try {
    const order = await CustomOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = "Cancelled";
    await order.save();

    res.status(200).json({ message: "Order cancelled" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
