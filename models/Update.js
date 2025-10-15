const mongoose = require("mongoose");

// Empty schema since we just want to access the collection as-is
const updateMsgSchema = new mongoose.Schema({}, { strict: false });

// Export the model, using the exact collection name "updatemsg"
module.exports = mongoose.model("UpdateMsg", updateMsgSchema, "updatemsg");
