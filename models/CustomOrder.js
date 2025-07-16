// models/CustomOrder.js
const mongoose = require("mongoose");

const customOrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  imageUrl: String,
  tshirtColor: String,
  totalPrice: Number,
  location: String,
  cancelTimeLeft: Number,
  status: { type: String, default: "Pending" },
}, { timestamps: true });

module.exports = mongoose.model("CustomOrder", customOrderSchema);
