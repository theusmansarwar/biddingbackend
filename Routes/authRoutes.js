const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getAllUsers,
  updateUser,
  deleteMultipleUsers,
} = require("../Controller/authController");
const { authMiddleware, adminMiddleware } = require("../Middleware/authMiddleware");

// Public routes
router.post("/register", register);
router.post("/login", login);

// Admin-only routes
router.get("/users", adminMiddleware, getAllUsers);
router.put("/users/:id", adminMiddleware, updateUser);
router.post("/users/delete-multiple", adminMiddleware, deleteMultipleUsers);

module.exports = router;
