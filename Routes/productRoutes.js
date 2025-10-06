const express = require("express");
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  deleteMultipleProducts,
  getProductsByUser,
} = require("../Controller/productController");

// Create new product
router.post("/", createProduct);
router.get("/", getProducts);
router.get("/list", getProductsByUser);
router.get("/:id", getProductById);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.post("/delete-multiple", deleteMultipleProducts);

module.exports = router;
