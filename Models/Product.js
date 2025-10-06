const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  images: [{ type: String }], // Array of image URLs
  minimumBid: { type: Number, required: true },
  soldOut: { type: Boolean, default: false },
  auctionEndDate: { type: Date, required: true },
  bids: [{ type: mongoose.Schema.Types.ObjectId, ref: "Bid" }],
}, { timestamps: true });

module.exports = mongoose.model("Product", ProductSchema);
