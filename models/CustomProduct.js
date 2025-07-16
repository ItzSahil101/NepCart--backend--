const mongoose = require("mongoose");

const customSchema = new mongoose.Schema({}, { strict: false });

const CustomProduct =
  mongoose.models.Product || mongoose.model("Product", customSchema, "customProduct");

module.exports = CustomProduct;
