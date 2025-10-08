const mongoose = require("mongoose");
const Bid = require("../Models/Bid");
const Product = require("../Models/Product");

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
      artistName,
      artistBio,
      artistCountry,
    } = req.body;

    // Required field check
    if (!title || !minimumBid || !auctionStartDate || !auctionEndDate || !artistName) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const product = new Product({
      title,
      description,
      image,
      minimumBid,
      auctionStartDate,
      auctionEndDate,
      artistName,
      artistBio,
      artistCountry,
    });

    await product.save();
    res.status(201).json({ status:  201, product });
  } catch (err) {
    res.status(500).json({ status:  500, error: err.message });
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

// ✅ User: Get only active + available products (Paginated + Search)
exports.getProductsByUser = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const now = new Date();
    const query = {
       isDeleted: false,
      isActive: true,
      $or: [
        { title: { $regex: search, $options: "i" } },
      ],
    };

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
       .populate({
        path: "bids",
        options: { sort: { bidAmount: -1 }, limit: 5 },
        populate: {
          path: "bidder", // 👈 populate bidder inside each bid
          select: "name email phone", // choose which fields to return
        },
      })
      
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


// ✅ Get single product (with all bids)
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, isDeleted: false }) .populate({
        path: "bids",
        options: { sort: { bidAmount: -1 }, limit: 5 },
        populate: {
          path: "bidder", 
          select: "name email phone", 
        },
      })
    if (!product) return res.status(404).json({ status:  404, message: "Product not found" });
    res.status(200).json({ status:  200, product });
  } catch (err) {
    res.status(500).json({ status:  500, error: err.message });
  }
};

// ✅ Update product
exports.updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedProduct)
      return res.status(404).json({ status:  404, message: "Product not found" });

    res.status(200).json({ status:  200, product: updatedProduct });
  } catch (err) {
    res.status(500).json({ status:  500, error: err.message });
  }
};



exports.deleteMultipleProducts = async (req, res) => {
  try {
    const { ids } = req.body;

    // ✅ Validate input
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        status: 400,
        message: "Please provide an array of IDs",
      });
    }

    // ✅ Validate ObjectIds to prevent CastError
    const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length === 0) {
      return res.status(400).json({
        status: 400,
        message: "No valid ObjectIds provided",
      });
    }

    // ✅ Find all related bids
    const relatedBids = await Bid.find({ product: { $in: validIds }, isDeleted: false });

    // ✅ Soft delete related bids
    await Bid.updateMany(
      { product: { $in: validIds } },
      { $set: { isDeleted: true } }
    );

    // ✅ Soft delete products
    await Product.updateMany(
      { _id: { $in: validIds } },
      { $set: { isDeleted: true } }
    );

    res.status(200).json({
      status: 200,
      message: "Products and their related bids soft deleted successfully",
      deleted: {
        products: validIds.length,
        bids: relatedBids.length,
      },
    });
  } catch (err) {
    console.error("Error deleting products and bids:", err);
    res.status(500).json({ status: false, error: err.message });
  }
};
