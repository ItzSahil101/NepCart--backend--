const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Product",
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
  status: {
    type: String,
    enum: ["Delivering", "Delivered", "Cancelled"],
    default: "Delivering",
  },
});

const purchaseSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Product",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    location: {
      type: String,
      required: true,
    },
    cmsg: {
      type: String,
      default: "",
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    products: [productSchema],
    cancelTimeLeft: {
      type: Number,
      default: 3600,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Purchase", purchaseSchema);
