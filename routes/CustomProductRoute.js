// routes/CustomProductRoute.js
const express = require("express");
const router = express.Router();
const CustomProduct = require("../models/CustomProduct");

// ✅ Get all custom products
router.get("/", async (req, res) => {
  try {
    const products = await CustomProduct.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch custom products", error: error.message });
  }
});

// ✅ Get single custom product by _id
router.get("/:id", async (req, res) => {
  try {
    const product = await CustomProduct.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Custom product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Error fetching product", error: error.message });
  }
});

// ✅ Create a new custom product
router.post("/", async (req, res) => {
  try {
    const newProduct = new CustomProduct(req.body);
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: "Error creating product", error: error.message });
  }
});

// ✅ Update a custom product
router.put("/:id", async (req, res) => {
  try {
    const updated = await CustomProduct.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating product", error: error.message });
  }
});

// ✅ Delete a custom product
router.delete("/:id", async (req, res) => {
  try {
    await CustomProduct.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product", error: error.message });
  }
});

module.exports = router;
