const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// Storage for uploaded files
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// Serve static files
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Upload endpoint
app.post("/upload", upload.single("file"), (req, res) => {
  const tempPath = req.file.path;
  const targetPath = path.join(__dirname, "uploads", req.file.originalname);

  fs.rename(tempPath, targetPath, err => {
    if (err) return res.status(500).send("File save failed.");
    res.redirect(`/run/${encodeURIComponent(req.file.originalname)}`);
  });
});

// Run HTML file
app.get("/run/:filename", (req, res) => {
  const filePath = path.join(__dirname, "uploads", req.params.filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send("File not found");
  }
});

// Basic upload form
app.get("/", (req, res) => {
  res.send(`
    <h2>Upload HTML File (Max 100MB)</h2>
    <form action="/upload" method="post" enctype="multipart/form-data">
      <input type="file" name="file" accept=".html" required />
      <button type="submit">Upload & Run</button>
    </form>
  `);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
