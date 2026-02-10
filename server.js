const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});

app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

app.post("/upload", upload.single("file"), (req, res) => {
  const tempPath = req.file.path;
  const targetPath = path.join(__dirname, "uploads", req.file.originalname);

  fs.rename(tempPath, targetPath, err => {
    if (err) return res.status(500).send("File save failed.");
    res.send("OK");
  });
});

app.get("/run/:filename", (req, res) => {
  const filePath = path.join(__dirname, "uploads", req.params.filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send("File not found");
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
