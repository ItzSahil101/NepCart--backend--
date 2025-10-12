const express = require("express");
const router = express.Router();
const Purchase = require("../models/Purchase");
const Product = require("../models/ProductModel");
const User = require("../models/userModel");
const CustomProduct = require("../models/CustomProduct");

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

    const purchases = await Purchase.find({ userId }).sort({ createdAt: -1 });

    const enrichedPurchases = await Promise.all(
      purchases.map(async (purchase) => {
        const enrichedProducts = await Promise.all(
          purchase.products.map(async (item) => {
            // Try to find product in Product collection
            let productDetails = await Product.findById(item.productId).lean();

            // If not found in Product, try CustomProduct
            if (!productDetails) {
              productDetails = await CustomProduct.findById(item.productId).lean();
            }

            // If still not found, fallback to null
            if (!productDetails) productDetails = null;

            return {
              ...item._doc,
              productId: productDetails,
            };
          })
        );

        return {
          _id: purchase._id,
          userId: purchase.userId,
          location: purchase.location,
          totalPrice: purchase.totalPrice,
          createdAt: purchase.createdAt,
          cancelTimeLeft: purchase.cancelTimeLeft,
          products: enrichedProducts,
          status: purchase.status || "Pending",
        };
      })
    );

    res.status(200).json(enrichedPurchases);
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
