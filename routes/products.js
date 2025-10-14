const express = require("express");
const router = express.Router();
const Product = require("../models/ProductModel");
const User = require("../models/userModel");

// ========================
// GET all products
// ========================
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// ========================
// GET top purchasers (username and purchaseProducts)
// ========================
router.get("/top-users", async (req, res) => {
  try {
    const topUsers = await User.find({}, "userName purchaseProducts")
      .sort({ purchaseProducts: -1 })
      .exec();

    res.status(200).json(topUsers);
  } catch (error) {
    console.error("Error fetching top users:", error);
    res.status(500).json({ message: "Failed to fetch top users" });
  }
});

// ========================
// GET product by ID (search by productId field)
router.get("/product/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Looking for productId:", id);

    // Search by productId field first
    let product = await Product.findOne({ productId: id });

    // fallback: try findById if productId field not found
    if (!product) {
      product = await Product.findById(id);
    }

    if (!product) {
      console.log("Product not found!");
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Failed to fetch product" });
  }
});


module.exports = router;
