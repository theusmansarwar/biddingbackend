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
router.post("/adminLogin", login);

// Admin-only routes
router.get("/users", getAllUsers);
router.put("/users/:id", updateUser);
router.post("/users/delete-multiple",  deleteMultipleUsers);

module.exports = router;
