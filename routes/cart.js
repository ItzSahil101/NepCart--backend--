const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Product = require("../models/ProductModel");
const JWT_SECRET = process.env.JWTPRIVATEKEY;

// Middleware to extract user from cookie
const getUserFromToken = async (req) => {1
  const token = req.cookies.token;
  if (!token) throw new Error("No token provided");

  const decoded = jwt.verify(token, JWT_SECRET);
  const user = await User.findById(decoded._id);
  if (!user) throw new Error("User not found");
  return user;
};

// ✅ Add to cart
router.post("/add", async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    const { productId } = req.body;

    if (!productId) return res.status(400).json({ error: "Product ID is required" });

    // prevent duplicates
    if (user.cart.includes(productId)) {
      return res.status(400).json({ message: "Already in cart" });
    }

    user.cart.push(productId);
    await user.save();

    res.status(200).json({ message: "Added to cart" });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Get all cart items
router.get("/", async (req, res) => {
  try {
    const user = await getUserFromToken(req);

    await user.populate("cart");

    res.json(user.cart);
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Remove from cart
router.delete("/remove/:productId", async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    const { productId } = req.params;

    user.cart = user.cart.filter(
      (id) => id.toString() !== productId
    );

    await user.save();
    res.json({ message: "Item removed from cart ✅" });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
