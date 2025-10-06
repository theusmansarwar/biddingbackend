const Bid = require("../Models/Bid");
const Product = require("../Models/Product");

let io;

// ✅ Called from index.js to pass socket instance
exports.setSocket = (socketInstance) => {
  io = socketInstance;
};

// ✅ Place a new bid
exports.placeBid = async (req, res) => {
  try {
    const { productId, bidderId, bidAmount } = req.body;

    // Validate input
    if (!productId || !bidderId || !bidAmount) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const product = await Product.findById(productId).populate("bids");
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (product.soldOut) return res.status(400).json({ message: "Auction closed" });

    // ✅ Find highest bid or use minimumBid
    const highestBid = product.bids.length > 0
      ? Math.max(...product.bids.map((b) => b.bidAmount))
      : product.minimumBid;

    if (bidAmount <= highestBid) {
      return res.status(400).json({
        message: `Next bid must be higher than $${highestBid}`,
      });
    }

    // ✅ Save new bid
    const bid = new Bid({
      product: productId,
      bidder: bidderId, // ← store bidder reference instead of name
      bidAmount,
    });
    await bid.save();
    await bid.populate("bidder", "name email");

    // ✅ Link bid to product
    product.bids.push(bid._id);
    await product.save();

    // ✅ Emit real-time update
    if (io) {
      io.emit("bidUpdated", {
        productId,
        bidderId: bid.bidder,
        bidAmount,
        nextMinBid: bidAmount + 1,
      });
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
    const bids = await Bid.find()               // get all bids
      .populate("bidder", "name email")         // populate bidder info
      .populate("product", "title minimumBid")  // populate product info
      .sort({ createdAt: -1 });                 // newest first

    res.status(200).json(bids);                 // return plain list
  } catch (err) {
    console.error("❌ Error fetching all bids:", err);
    res.status(500).json({ error: err.message });
  }

};