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
// GET product by ID (works for Product collection or embedded in orders)
router.get("/product/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Try to find in Product collection
    let product = await Product.findOne({ productId: id });
    if (product) return res.status(200).json(product);

    // 2️⃣ If not found, try to get from any order's products array
    const order = await Order.findOne({ productId: id });
    if (order && order.products && order.products.length > 0) {
      // Return first product from array (adjust if multiple)
      return res.status(200).json(order.products[0]);
    }

    // 3️⃣ Not found anywhere
    return res.status(404).json({ message: "Product not found" });
  } catch (error) {
    console.error("Error fetching product:", error);
    return res.status(500).json({ message: "Failed to fetch product" });
  }
});


module.exports = router;
