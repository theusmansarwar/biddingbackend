const express = require("express");
const router = express.Router();
const {
  createArtist,
  getArtists,
  getArtistById,
  updateArtist,
  getActiveArtists,
  deleteMultipleArtists,
} = require("../Controller/artistController");

// ✅ Create new artist
router.post("/", createArtist);

// ✅ Get all artists
router.get("/", getArtists);

// ✅ Get artist list by user (if filtered)
router.get("/list", getActiveArtists);

// ✅ Get artist by ID
router.get("/:id", getArtistById);

// ✅ Update artist
router.put("/:id", updateArtist);

// ✅ Soft delete multiple artists
router.delete("/delete-multiple", deleteMultipleArtists);

module.exports = router;
