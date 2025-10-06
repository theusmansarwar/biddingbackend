const mongoose = require("mongoose");

const BidSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  bidderName: { type: String, required: true },
  bidAmount: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Bid", BidSchema);
