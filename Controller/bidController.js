const Bid = require("../Models/Bid");
const Product = require("../Models/Product");

let io; // to store socket.io instance

// ✅ Called from index.js to pass socket instance
exports.setSocket = (socketInstance) => {
  io = socketInstance;
};

// ✅ Place a new bid
exports.placeBid = async (req, res) => {
  try {
    const { productId, bidderName, bidAmount } = req.body;
    const product = await Product.findById(productId).populate("bids");

    if (!product) return res.status(404).json({ message: "Product not found" });
    if (product.soldOut) return res.status(400).json({ message: "Auction closed" });

    // ✅ Find highest bid or use minimumBid
    const highestBid = product.bids.length > 0
      ? Math.max(...product.bids.map(b => b.bidAmount))
      : product.minimumBid;

    // ✅ Enforce next bid > current highest
    if (bidAmount <= highestBid) {
      return res.status(400).json({
        message: `Next bid must be higher than $${highestBid}`,
      });
    }

    // ✅ Save new bid
    const bid = new Bid({ product: productId, bidderName, bidAmount });
    await bid.save();

    // ✅ Link bid to product
    product.bids.push(bid._id);
    await product.save();

    // ✅ Emit real-time event to all clients
    if (io) {
      io.emit("bidUpdated", {
        productId,
        bidderName,
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
exports.getTopBids = async (req, res) => {
  try {
    const { productId } = req.params;

    const bids = await Bid.find({ product: productId })
      .sort({ bidAmount: -1 })
      .limit(5);

    res.status(200).json(bids);
  } catch (err) {
    console.error("❌ Get top bids error:", err);
    res.status(500).json({ error: err.message });
  }
};
