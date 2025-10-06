require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./utils/db");
const path = require("path");
const productRoutes = require("./Routes/productRoutes");
const bidRoutes = require("./Routes/bidRoutes");
const authRoutes = require("./Routes/authRoutes");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/bids", bidRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
const multer = require("multer");
app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ limit: "200mb", extended: true }));

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

// after all routes
app.use((err, req, res, next) => {
  console.error("Error middleware caught:", err);

  // Multer file size error
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      status: 413,
      message: "File too large! Please upload smaller files.",
    });
  }

  // Body size exceeded (express / nginx)
  if (err.status === 413) {
    return res.status(413).json({
      status: 413,
      message: "Request entity too large! Please reduce file size or request payload.",
    });
  }

  res.status(err.status || 500).json({
    status: err.status || 500,
    message: err.message || "Internal Server Error",
  });
});

app.post("/upload-image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    file:fileUrl,
    isSuccess: true,
    messages: ["Image uploaded successfully"],
  });
});


// Connect to DB and start server
connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB:", err);
  });
