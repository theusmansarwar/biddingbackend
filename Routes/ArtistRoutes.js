const express = require("express");
const router = express.Router();
const {
  createArtist,
  getArtists,
  getArtistById,
  updateArtist,
  getActiveArtists,
  deleteMultipleArtists,
  getActivefeaturedArtists,
} = require("../Controller/artistController");

router.post("/", createArtist);

// ✅ Get all artists
router.get("/", getArtists);

// ✅ Get artist list by user (if filtered)
router.get("/list", getActiveArtists);
router.get("/featured", getActivefeaturedArtists);

// ✅ Get artist by ID
router.get("/:id", getArtistById);

// ✅ Update artist
router.put("/:id", updateArtist);

// ✅ Soft delete multiple artists
router.delete("/delete-multiple", deleteMultipleArtists);

module.exports = router;
