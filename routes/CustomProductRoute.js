const express = require("express");
const router = express.Router();
const CustomProduct = require("../models/CustomProduct");

router.get("/", async (req, res) => {
  try {
    const products = await CustomProduct.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await CustomProduct.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Error fetching product" });
  }
});

router.post("/", async (req, res) => {
  try {
    const newProduct = new CustomProduct(req.body);
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: "Error creating product" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updated = await CustomProduct.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating product" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await CustomProduct.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product" });
  }
});

module.exports = router;
