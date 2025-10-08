const bcrypt = require("bcryptjs");
const userModel = require("../Models/userModel");

// ✅ Register
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
      token,
    });
  } catch (err) {
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
};

// ✅ Login (Block deleted users)
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password)
      return res.status(400).json({ status: 400, message: "Email and password are required" });

    const user = await userModel.findOne({ email });
    if (!user) return res.status(404).json({ status: 404, message: "User not found" });

    // ⛔ Check if user is deleted
    if (user.isDeleted) {
      return res.status(403).json({ status: 403, message: "This user has been deleted" });
    }

    const match = await user.comparePassword(password);
    if (!match) return res.status(400).json({ status: 400, message: "Invalid credentials" });

    // ⛔ Prevent user from accessing admin panel
    if (role && user.role !== "admin") {
      return res.status(403).json({ status: 403, message: "Access denied: not an admin" });
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

// ✅ Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const query = search
      ? {
          isDeleted: false, // exclude deleted users
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
          ],
        }
      : { isDeleted: false };

    const totalUsers = await userModel.countDocuments(query);
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
      totalPages: Math.ceil(totalUsers / limitNum),
      users,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users", error: err.message });
  }
};

// ✅ Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role } = req.body;

    const updatedUser = await userModel.findByIdAndUpdate(
      id,
      { name, email, phone, role },
      { new: true }
    );

    if (!updatedUser)
      return res.status(404).json({ status: 404, message: "User not found" });

    res.status(200).json({
      status: 200,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update user", error: err.message });
  }
};

// ✅ Soft Delete Multiple Users
exports.deleteMultipleUsers = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No user IDs provided" });
    }

    await userModel.updateMany(
      { _id: { $in: ids } },
      { $set: { isDeleted: true } }
    );

    res.status(200).json({
      status: 200,
      message: "Users marked as deleted successfully",
      deletedIds: ids,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete users", error: err.message });
  }
};
