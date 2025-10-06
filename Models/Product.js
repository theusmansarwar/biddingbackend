const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    image: { type: String , required: true}, // Array of image URLs
    minimumBid: { type: Number, required: true },
    soldOut: { type: Boolean, default: false },
    auctionStartDate: { type: Date, required: true },
    auctionEndDate: { type: Date, required: true },
    bids: [{ type: mongoose.Schema.Types.ObjectId, ref: "Bid" }],

    // ✅ Manual artist info
    artistName: { type: String, required: true }, // e.g. "John Doe"
    artistBio: { type: String }, // optional, e.g. "Contemporary painter from NYC"
    artistCountry: { type: String }, // optional\

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
