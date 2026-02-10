const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve uploaded files from /public
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Multer setup for uploads up to 100 MB
const upload = multer({
    dest: 'public/',
    limits: { fileSize: 100 * 1024 * 1024 } // 100 MB
});

// Serve the frontend UI
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.send('No file uploaded.');

    const originalName = req.file.originalname;
    const newPath = path.join('public', originalName);

    fs.rename(req.file.path, newPath, err => {
        if (err) return res.send('Error saving file.');
        // Respond with the link to open in a new tab
        res.send(`<script>
            window.open('/${originalName}', '_blank');
            window.location.href = '/';
        </script>`);
    });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
