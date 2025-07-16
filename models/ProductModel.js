const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({}, { strict: false });

module.exports = mongoose.model("Product", productSchema, "productDaata");
