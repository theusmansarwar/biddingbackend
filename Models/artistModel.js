const mongoose = require("mongoose");

const ArtistSchema = new mongoose.Schema(
  {
  
    artistName: { type: String, required: true }, 
    artistBio: { type: String }, 
    artistCountry: { type: String }, 
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },

  },
  { timestamps: true }
);

module.exports = mongoose.model("Artists", ArtistSchema);
