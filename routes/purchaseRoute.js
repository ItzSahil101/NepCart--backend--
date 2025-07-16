const express = require("express");
const router = express.Router();
const Purchase = require("../models/Purchase");
const Product = require("../models/ProductModel");
const User = require("../models/userModel");

// Create purchase
router.post("/", async (req, res) => {
  try {
    const { productId, userId, location, totalPrice, products } = req.body;

    if (!productId || !userId || !location || !totalPrice || !products?.length) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const newPurchase = new Purchase({
      productId,
      userId,
      location,
      totalPrice,
      products,
    });

    const savedPurchase = await newPurchase.save();
    res.status(201).json({ message: "Purchase successful!", purchase: savedPurchase });
  } catch (error) {
    console.error("Purchase creation failed:", error);
    res.status(500).json({ message: "Server error while creating purchase." });
  }
});

// Cancel purchase by ID - removes purchase document if within allowed time
router.put("/:id/cancel", async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found." });
    }

    const createdAt = new Date(purchase.createdAt);
    const now = new Date();
    const diffInSeconds = (now - createdAt) / 1000;

    if (diffInSeconds <= purchase.cancelTimeLeft) {
      // Remove the entire purchase document
      await Purchase.findByIdAndDelete(req.params.id);
      return res.status(200).json({ message: "Order cancelled and removed successfully." });
    } else {
      return res.status(400).json({ message: "Cancellation time expired." });
    }
  } catch (error) {
    console.error("Cancellation failed:", error);
    res.status(500).json({ message: "Server error while cancelling order." });
  }
});

// Get all purchases by user ID, with nested product details populated
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const purchases = await Purchase.find({ userId })
      .populate("products.productId")  // populate each productId inside products array with full product info (image, description, etc)
      .sort({ createdAt: -1 });

    res.status(200).json(purchases);
  } catch (err) {
    console.error("Error fetching user purchases:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get product detail by ID
router.get("/product/:productId", async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Server error fetching product" });
  }
});

module.exports = router;
