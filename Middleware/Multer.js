const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// File filter to allow images for thumbnail and any type for resume
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype === "application/pdf" ||
    file.mimetype === "application/msword" ||
    file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only image files and resumes (PDF/DOC/DOCX) are allowed!"), false);
  }
};

// Multer Upload Middleware (to handle both resume and thumbnail)
const upload = multer({ storage: storage, fileFilter: fileFilter, limits: { fileSize: 100 * 1024 * 1024 }, }).fields([
  { name: "thumbnail", maxCount: 1 }, // for blog thumbnail
  { name: "resume", maxCount: 1 }, // for resume file
]);

module.exports = upload;
