import express from "express";
import multer from "multer";
import { v4 as uuid } from "uuid";
import path from "path";
import fs from "fs";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Multer disk streaming (no memory buffering)
const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100 MB
  },
  fileFilter(req, file, cb) {
    if (file.originalname.endsWith(".html")) cb(null, true);
    else cb(new Error("Only HTML files allowed"));
  }
});

app.post("/upload", upload.single("html"), (req, res) => {
  const id = uuid();
  const filePath = path.join(uploadDir, `${id}.html`);

  fs.renameSync(req.file.path, filePath);
  res.json({ url: `/view/${id}` });
});

app.get("/view/:id", (req, res) => {
  const filePath = path.join(uploadDir, `${req.params.id}.html`);
  if (!fs.existsSync(filePath)) return res.sendStatus(404);

  res.setHeader("Content-Type", "text/html");
  fs.createReadStream(filePath).pipe(res);
});

app.listen(PORT, () => {
  console.log(`HTML Viewer running on port ${PORT}`);
});
