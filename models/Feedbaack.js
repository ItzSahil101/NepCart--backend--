const mongoose = require("mongoose")

const FeedbackSchema = new mongoose.Schema({
      userName: { type: String, required: true },
      number: { type: Number, required: true},
      message: { type: String, required: true},
},  { timestamps: true })

module.exports = mongoose.model("Feedback", FeedbackSchema);
