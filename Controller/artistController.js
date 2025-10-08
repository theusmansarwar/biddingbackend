const mongoose = require("mongoose");
const artistModel = require("../Models/artistModel");

// ✅ Create Artist
exports.createArtist = async (req, res) => {
  try {
    const { artistName, artistBio, artistCountry, isActive, isFeatured } = req.body;

    const missingFields = [];
    if (!artistName) missingFields.push({ name: "artistName", message: "Artist name is required" });
    if (!artistBio) missingFields.push({ name: "artistBio", message: "Artist Bio is required" });
    if (!artistCountry) missingFields.push({ name: "artistCountry", message: "Artist Country is required" });

    if (missingFields.length > 0) {
      return res.status(400).json({ status: 400, message: "Validation failed", missingFields });
    }

    const newArtist = new artistModel({
      artistName,
      artistBio,
      artistCountry,
      isActive,
      isFeatured,
    });

    await newArtist.save();
    res.status(201).json({ status: 201, message: "Artist created successfully", artist: newArtist });
  } catch (err) {
    res.status(500).json({ status: 500, error: err.message });
  }
};

// ✅ Update Artist
exports.updateArtist = async (req, res) => {
  try {
    const { artistName, artistBio, artistCountry, isActive, isFeatured } = req.body;

    const missingFields = [];
    if (!artistName) missingFields.push({ name: "artistName", message: "Artist name is required" });
    if (!artistBio) missingFields.push({ name: "artistBio", message: "Artist Bio is required" });
    if (!artistCountry) missingFields.push({ name: "artistCountry", message: "Artist Country is required" });
    if (missingFields.length > 0) {
      return res.status(400).json({ status: 400, message: "Validation failed", missingFields });
    }

    const artist = await artistModel.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { artistName, artistBio, artistCountry, isActive, isFeatured },
      { new: true, runValidators: true }
    );

    if (!artist) return res.status(404).json({ status: 404, message: "Artist not found or deleted" });

    res.status(200).json({ status: 200, message: "Artist updated successfully", artist });
  } catch (err) {
    res.status(500).json({ status: 500, error: err.message });
  }
};

// ✅ Get all Artists (Admin) — Paginated + Search
exports.getArtists = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const query = {
      isDeleted: false,
      $or: [
        { artistName: { $regex: search, $options: "i" } },
        { artistCountry: { $regex: search, $options: "i" } },
      ],
    };

    const total = await artistModel.countDocuments(query);
    const artists = await artistModel.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      status: 200,
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      artists,
    });
  } catch (err) {
    res.status(500).json({ status: 500, error: err.message });
  }
};

// ✅ Get only Active Artists (User)
exports.getActiveArtists = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const query = {
      isActive: true,
      isDeleted: false,
      $or: [
        { artistName: { $regex: search, $options: "i" } },
        { artistCountry: { $regex: search, $options: "i" } },
      ],
    };

    const total = await artistModel.countDocuments(query);
    const artists = await artistModel.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      status: 200,
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      artists,
    });
  } catch (err) {
    res.status(500).json({ status: 500, error: err.message });
  }
};

// ✅ Get Artist by ID
exports.getArtistById = async (req, res) => {
  try {
    const artist = await artistModel.findOne({ _id: req.params.id, isDeleted: false });
    if (!artist) return res.status(404).json({ status: 404, message: "Artist not found" });
    res.status(200).json({ status: 200, artist });
  } catch (err) {
    res.status(500).json({ status: 500, error: err.message });
  }
};

// ✅ Soft Delete Multiple Artists
exports.deleteMultipleArtists = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ status: 400, message: "Please provide an array of IDs" });
    }

    const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length === 0) {
      return res.status(400).json({ status: 400, message: "No valid ObjectIds provided" });
    }

    const result = await artistModel.updateMany(
      { _id: { $in: validIds } },
      { $set: { isDeleted: true } }
    );

    res.status(200).json({
      status: 200,
      message: "Artists soft deleted successfully",
      deletedCount: result.modifiedCount,
    });
  } catch (err) {
    res.status(500).json({ status: 500, error: err.message });
  }
};
