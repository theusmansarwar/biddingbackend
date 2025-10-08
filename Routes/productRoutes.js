const express = require("express");
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
    getProductsByUser,
  deleteMultipleProducts,

} = require("../Controller/productController");

// Create new product
router.post("/", createProduct);
router.get("/", getProducts);
router.get("/list", getProductsByUser);
router.get("/:id", getProductById);
router.put("/:id", updateProduct);
router.delete("/delete-multiple", deleteMultipleProducts);

module.exports = router;
