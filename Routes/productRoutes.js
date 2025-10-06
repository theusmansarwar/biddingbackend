const express = require("express");
const router = express.Router();
const { createProduct, getProducts, getProductById } = require("../Controller/productController");

router.post("/", createProduct);
router.get("/", getProducts);
router.get("/:id", getProductById);

module.exports = router;
