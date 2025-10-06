const Product = require("../Models/Product");


// Create auction product
exports.createProduct = async (req, res) => {
  try {
    const { title, description, images, minimumBid, auctionEndDate } = req.body;
    const product = new Product({
      title,
      description,
      images,
      minimumBid,
      auctionEndDate,
    });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all auction products (with top 5 bids)
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate({
        path: "bids",
        options: { sort: { bidAmount: -1 }, limit: 5 },
      })
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single product with bids
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("bids");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
