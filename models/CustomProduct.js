// models/CustomProduct.js ✅
const mongoose = require("mongoose");

const customSchema = new mongoose.Schema({}, { strict: false });

const CustomProduct = mongoose.models.CustomProduct || mongoose.model(
  "CustomProduct",
  customSchema,
  "customProduct" // make sure it exactly matches the collection name
);

module.exports = CustomProduct;
