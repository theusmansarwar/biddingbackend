const Bid = require("../Models/Bid");
const Product = require("../Models/Product");
const sendEmailToCompany = require("./emailverification");

let io;

// ✅ Called from index.js to pass socket instance
exports.setSocket = (socketInstance) => {
  io = socketInstance;
};

const broadcastLatestBids = async () => {
  try {
    const latestBids = await Bid.find({ isDeleted: false })
      .populate("bidder", "name email")
      .populate("product", "title minimumBid")
      .sort({ createdAt: -1 })
      .limit(5);

    if (io) io.emit("latestBids", latestBids);
  } catch (err) {
    console.error("❌ Error broadcasting latest bids:", err);
  }
};

// ✅ Place a new bid
exports.placeBid = async (req, res) => {
  try {
    const { productId, bidderId, bidAmount } = req.body;

    // Validate input
    if (!productId || !bidderId || !bidAmount) {
      return res.status(400).json({ message: "Missing required fields" });
    }

     // ✅ Fetch product with only non-deleted bids
    const product = await Product.findById(productId).populate({
      path: "bids",
      match: { deleted: false },
    });

    if (!product) return res.status(404).json({ message: "Product not found" });
    if (product.soldOut) return res.status(400).json({ message: "Auction closed" });

    // ✅ Determine the highest active bid (only non-deleted)
    const activeBids = product.bids.filter(b => !b.deleted);
    const highestBid =
      activeBids.length > 0
        ? Math.max(...activeBids.map(b => b.bidAmount))
        : product.minimumBid;

    // ✅ Validation: must exceed highest bid
    if (bidAmount <= highestBid) {
      return res.status(400).json({
        message: `Next bid must be higher than $${highestBid}`,
      });
    }

    // ✅ Save new bid
    const bid = new Bid({
      product: productId,
      bidder: bidderId,
      bidAmount,
    });
    await bid.save();
    await bid.populate("bidder", "name email");

    // ✅ Link bid to product
    product.bids.push(bid._id);
    await product.save();

    await sendEmailToCompany(bid.bidder.name, bid.bidder.email, res);

    // ✅ Emit real-time update
    if (io) {
      io.emit("bidUpdated", {
        productId,
        bidderId: bid.bidder,
        bidAmount,
        nextMinBid: bidAmount + 1,
      });
      await broadcastLatestBids();
    }

    res.status(201).json({
      message: "Bid placed successfully",
      bid,
      nextMinBid: bidAmount + 1,
    });
  } catch (err) {
    console.error("❌ Bid error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get top 5 bids for a product
exports.producttop5Bid = async (req, res) => {
  try {
    const { productId } = req.params;

    const bids = await Bid.find({ product: productId })
      .populate("bidder", "name email") // ✅ populate bidder info (optional)
      .sort({ bidAmount: -1 })
      .limit(5);

    res.status(200).json(bids);
  } catch (err) {
    console.error("❌ Get top bids error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get all bids paginated (all products)
exports.getAllBids = async (req, res) => {
  try {
    // ✅ Read pagination query params (default page 1, limit 10)
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    // ✅ Fetch paginated bids
    const bids = await Bid.find({ isDeleted: false })
      .populate("bidder", "name email phone")
      .populate("product", "title minimumBid")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // ✅ Count total bids for pagination info
    const totalBids = await Bid.countDocuments();
    const totalPages = Math.ceil(totalBids / limit);

    res.status(200).json({
      message: "Bids fetched successfully",
      bids,
      page,
      limit,
      totalBids,
      totalPages,
    });
  } catch (err) {
    console.error("❌ Error fetching all bids:", err);
    res.status(500).json({ error: err.message });
  }
};
exports.getLatest5Bids = async (req, res) => {
  try {
    const latestBids = await Bid.find({ isDeleted: false })
      .populate("bidder", "name email phone")
      .populate("product", "title minimumBid")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      message: "Latest 5 bids fetched successfully",
      latestBids,
    });
  } catch (err) {
    console.error("❌ Error fetching latest bids:", err);
    res.status(500).json({ error: err.message });
  }
};
// ✅ Soft delete multiple bids
exports.softDeleteMultipleBids = async (req, res) => {
  try {
    const { ids } = req.body; // Expect an array of IDs

    // Validate input
    if (!Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ status: 400, message: "ids must be a non-empty array" });
    }

    // Soft delete all matching bids
    const result = await Bid.updateMany(
      { _id: { $in: ids }, isDeleted: false },
      { $set: { isDeleted: true } }
    );

    res.status(200).json({
      status: 200,
      message: `${result.modifiedCount} bid(s) soft deleted successfully`,
    });
  } catch (err) {
    console.error("❌ Soft delete multiple error:", err);
    res.status(500).json({ error: err.message });
  }
};
