const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, file.originalname)
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});

app.use(express.static("public"));
app.use("/uploads", express.static(uploadsDir));

// Upload endpoint
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  // Return the URL of the uploaded file
  const url = `/uploads/${encodeURIComponent(req.file.originalname)}`;
  res.json({ url });
});

// Serve the uploaded file (already handled by express.static("/uploads"))
// Just a safety route in case we need /run/:filename
app.get("/run/:filename", (req, res) => {
  const filePath = path.join(uploadsDir, req.params.filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send("File not found");
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
