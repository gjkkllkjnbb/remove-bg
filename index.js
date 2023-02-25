// Remove Background Image
const express = require('express');
const app = express();
const setting = require('./setting.json');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');
const { processImage } = require('./lib/process');
const { exec } = require('child_process');

if (!fs.existsSync(path.join(process.cwd(), 'temporary'))) {
    console.log('Creating Temporary Folder...');
    fs.mkdirSync(path.join(process.cwd(), 'temporary'));
}

// Express
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static(path.join(process.cwd(), 'public')));
app.set('views', path.join(process.cwd(), 'views'));

// Multer ( File Upload )
const storage = multer.diskStorage({
    destination: path.join(process.cwd(), 'temporary'),
    filename: function (req, file, cb) {
        cb(null, crypto.randomBytes(16).toString('hex') + path.extname(file.originalname));
    }
});

// Limit File Size ( 10 MB )
const upload = multer({ storage: storage, limits: { fileSize: 1048576 * 10 } });

// Index Page
app.get('/', (req, res) => {
    res.render('index', { ...setting });
});

// Upload Image
app.post("/api/process/nobg", upload.single('image'), async (req, res) => {
    if (req.file) {
        if (req.file.mimetype != "image/png" && req.file.mimetype != "image/jpeg") return res.json({ error: "Only PNG and JPEG Image Allowed" });
        try {
            processImages = await processImage(req.file.path);
            res.json({ image: "data:image/png;base64," + processImages.toString('base64') });
        } catch (error) {
            res.json({ error: "Unknown Error, Please Try Again" });
            console.log(error);
        }
        fs.unlinkSync(req.file.path);
        console.log(req.file.path);
    } else {
        res.status(400).json({ error: "Please Upload some Image" });
    }
});

// Start Server
app.listen(process.env.PORT || 3000, () => {
    console.log('Server Started on Port ' + (process.env.PORT || 3000));
});
