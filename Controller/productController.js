const mongoose = require("mongoose");
const Bid = require("../Models/Bid");
const Product = require("../Models/Product");
const artistModel = require("../Models/artistModel");
// ✅ Create auction product
exports.createProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      image,
      minimumBid,
      auctionStartDate,
      auctionEndDate,
      soldOut,
      isActive,
      artistId,
    } = req.body;

    const missingFields = [];
    const Active = isActive === "true" || isActive === true;

    // ✅ Validate fields only if product is active
    if (Active) {
      if (!title) missingFields.push({ name: "title", message: "Title is required" });
      if (!description) missingFields.push({ name: "description", message: "Description is required" });
      if (!image) missingFields.push({ name: "image", message: "Image is required" });
      if (!minimumBid) missingFields.push({ name: "minimumBid", message: "Minimum Bid is required" });
      if (!auctionStartDate) missingFields.push({ name: "auctionStartDate", message: "Auction Start Date is required" });
      if (!auctionEndDate) missingFields.push({ name: "auctionEndDate", message: "Auction End Date is required" });
      if (!artistId) missingFields.push({ name: "artistId", message: "Artist ID is required" });
    }

    if (missingFields.length > 0) {
      return res.status(400).json({ status: 400, message: "Validation failed", missingFields });
    }

    // ✅ Validate artist
    let artist = null;
    if (artistId) {
      artist = await artistModel.findOne({ _id: artistId, isDeleted: false });
      if (!artist) {
        return res.status(404).json({ status: 404, message: "Artist not found or deleted" });
      }
    }

    const product = new Product({
      title,
      description,
      image,
      minimumBid,
      auctionStartDate,
      auctionEndDate,
      soldOut,
      isActive,
      artist: artistId || null,
    });

    await product.save();

    res.status(201).json({ status: 201, product });
  } catch (err) {
    res.status(500).json({ status: 500, error: err.message });
  }
};

// ✅ Update product
exports.updateProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      image,
      minimumBid,
      auctionStartDate,
      auctionEndDate,
      soldOut,
      isActive,
      artistId,
    } = req.body;

    const missingFields = [];
    const Active = isActive === "true" || isActive === true;

    if (Active) {
      if (!title) missingFields.push({ name: "title", message: "Title is required" });
      if (!description) missingFields.push({ name: "description", message: "Description is required" });
      if (!image) missingFields.push({ name: "image", message: "Image is required" });
      if (!minimumBid) missingFields.push({ name: "minimumBid", message: "Minimum Bid is required" });
      if (!auctionStartDate) missingFields.push({ name: "auctionStartDate", message: "Auction Start Date is required" });
      if (!auctionEndDate) missingFields.push({ name: "auctionEndDate", message: "Auction End Date is required" });
      if (!artistId) missingFields.push({ name: "artistId", message: "Artist ID is required" });
    }

    if (missingFields.length > 0) {
      return res.status(400).json({ status: 400, message: "Validation failed", missingFields });
    }

    // ✅ Validate artist before update
    let artist = null;
    if (artistId) {
      artist = await artistModel.findOne({ _id: artistId, isDeleted: false });
      if (!artist) {
        return res.status(404).json({ status: 404, message: "Artist not found or deleted" });
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body, artist: artistId || null },
      { new: true, runValidators: true }
    );

    if (!updatedProduct)
      return res.status(404).json({ status: 404, message: "Product not found" });

    res.status(200).json({ status: 200, product: updatedProduct });
  } catch (err) {
    res.status(500).json({ status: 500, error: err.message });
  }
};

// ✅ Admin: Get all auction products (Paginated + Search)
exports.getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const query = {
      isDeleted: false,
      $or: [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ],
    };

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate({
        path: "bids",
        options: { sort: { bidAmount: -1 }, limit: 5 },
      })
      .populate("artist") // ✅ populate artist data
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      status: 200,
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      products,
    });
  } catch (err) {
    res.status(500).json({ status: 500, error: err.message });
  }
};

// ✅ User: Get active + available products with artist info
exports.getProductsByUser = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const query = {
      isDeleted: false,
      isActive: true,
      $or: [{ title: { $regex: search, $options: "i" } }],
    };

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate({
        path: "bids",
        options: { sort: { bidAmount: -1 }, limit: 5 },
        populate: {
          path: "bidder",
          select: "name email phone",
        },
      })
      .populate("artist") // ✅ include artist info
      .sort({ auctionEndDate: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      status: 200,
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      products,
    });
  } catch (err) {
    res.status(500).json({ status: 500, error: err.message });
  }
};


// ✅ Get single product (with all bids and artist)
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isDeleted: false,
    })
      .populate("artist", "artistName artistBio artistCountry")
      .populate({
        path: "bids",
        options: { sort: { bidAmount: -1 }, limit: 5 },
        populate: {
          path: "bidder",
          select: "name email phone",
        },
      });

    if (!product)
      return res.status(404).json({ status: 404, message: "Product not found" });

    res.status(200).json({ status: 200, product });
  } catch (err) {
    res.status(500).json({ status: 500, error: err.message });
  }
};

// ✅ Soft delete multiple products
exports.deleteMultipleProducts = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ status: 400, message: "Please provide an array of IDs" });
    }

    const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length === 0) {
      return res.status(400).json({ status: 400, message: "No valid ObjectIds provided" });
    }

    const relatedBids = await Bid.find({ product: { $in: validIds }, isDeleted: false });

    await Bid.updateMany({ product: { $in: validIds } }, { $set: { isDeleted: true } });
    await Product.updateMany({ _id: { $in: validIds } }, { $set: { isDeleted: true } });

    res.status(200).json({
      status: 200,
      message: "Products and their related bids soft deleted successfully",
      deleted: { products: validIds.length, bids: relatedBids.length },
    });
  } catch (err) {
    console.error("Error deleting products and bids:", err);
    res.status(500).json({ status: false, error: err.message });
  }
};
