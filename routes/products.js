const express = require("express");
const router = express.Router();
const Product = require("../models/ProductModel");
const User = require("../models/userModel");
const ProductModel = require("../models/ProductModel");
const PurchaseModel = require("../models/PurchaseModel");

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
// GET product by ID
router.get("/product/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Fetching product with ID:", id);

    // Find product by _id in Product collection
    const product = await ProductModel.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Send product data as response
    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return res.status(500).json({ message: "Failed to fetch product" });
  }
});

//See total orders num
// See total orders num
router.get("/total-orders", async (req, res) => {
  try {
    // Option 1: estimatedDocumentCount (fast, does not consider query filters)
    const totalOrders = await PurchaseModel.estimatedDocumentCount();

    // Option 2: find all and get length (slightly slower, but guaranteed accurate)
    // const totalOrders = (await PurchaseModel.find({})).length;

    res.status(200).json({ totalOrders });
  } catch (error) {
    console.error("Error fetching total orders:", error);
    res.status(500).json({ message: "Failed to fetch total orders" });
  }
});



module.exports = router;
