const express = require("express");
const router = express.Router();
const { register, login, getAllUsers } = require("../Controller/authController");
const { authMiddleware, adminMiddleware } = require("../Middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);

// Admin routes
router.get("/users", authMiddleware, adminMiddleware, getAllUsers);

module.exports = router;
