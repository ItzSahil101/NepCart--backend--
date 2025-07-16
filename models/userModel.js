const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  number: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  location: { type: String, default: "Not specified" },
  verified: { type: Boolean, default: false },
  cart: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    purchaseProducts: { type: Number, default: 0 },  
}, { timestamps: true });

userSchema.methods.generateAuthToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWTPRIVATEKEY, { expiresIn: "7d" });
};

module.exports = mongoose.model("User", userSchema);
