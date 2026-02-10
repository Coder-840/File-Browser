const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// Multer storage
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});

app.use(express.static("public"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Upload endpoint
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const tempPath = req.file.path;
  const targetPath = path.join(__dirname, "uploads", req.file.originalname);

  fs.rename(tempPath, targetPath, err => {
    if (err) return res.status(500).json({ error: "File save failed" });

    // Send back the URL of the uploaded file
    res.json({ url: `/run/${encodeURIComponent(req.file.originalname)}` });
  });
});

// Serve uploaded HTML file
app.get("/run/:filename", (req, res) => {
  const filePath = path.join(__dirname, "uploads", req.params.filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send("File not found");
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
