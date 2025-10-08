const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    image: { type: String, required: true },
    catalogFile: { type: String },
    minimumBid: { type: Number, required: true },
    soldOut: { type: Boolean, default: false },
    auctionStartDate: { type: Date, required: true },
    auctionEndDate: { type: Date, required: true },
    bids: [{ type: mongoose.Schema.Types.ObjectId, ref: "Bid" }],
    isActive: { type: Boolean, default: true },
   artist: { type: mongoose.Schema.Types.ObjectId, ref: "Artists" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
