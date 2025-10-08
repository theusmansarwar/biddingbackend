
const bcrypt = require("bcryptjs");
const userModel = require("../Models/userModel");

// Register (for both users and admins)
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !phone || !password)
      return res.status(400).json({ message: "All fields are required" });

    const existing = await userModel.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    const user = new userModel({ name, email, phone, password, role });
    await user.save();
 const token = user.generateToken();
    res.status(201).json({
      message: "Registered successfully",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password ,role} = req.body;

    if (!email || !password)
      return res.status(400).json({ status: 400, message: "Email and password are required" });

    const user = await userModel.findOne({ email });
    if (!user) return res.status(404).json({status: 404, message: "User not found" });

    const match = await user.comparePassword(password);
    if (!match) return res.status(400).json({status: 400, message: "Invalid credentials" });

    // ✅ Prevent user from logging into admin panel
    if ( role && user.role !== "admin") {
      return res.status(403).json({status: 403, message: "Access denied: not an admin" });
    }

    const token = user.generateToken();
    const { password: _, ...userData } = user.toObject();

    res.status(200).json({
      status: 200,
      message: "Login successful",
      token,
      user: userData,
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    // ✅ Convert query params to numbers
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // ✅ Build search query
    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    // ✅ Get total count (for pagination info)
    const total = await userModel.countDocuments(query);

    // ✅ Fetch users with pagination + search
    const users = await userModel
      .find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.status(200).json({
      status: 200,
      message: "User list fetched successfully",
        totalUsers,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      users,
    });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({
      status: 500,
      message: "Failed to fetch users",
      error: err.message,
    });
  }
};
