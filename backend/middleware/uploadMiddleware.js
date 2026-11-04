const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure local uploads folder exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Memory storage so file buffer is available for Cloudinary upload or local saving
const storage = multer.memoryStorage();

// Allowed file types: PDF and standard web images
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ];

  const extname = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];

  if (
    allowedMimeTypes.includes(file.mimetype) &&
    allowedExtensions.includes(extname)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Invalid file type. Only PDF and image files (.jpg, .jpeg, .png, .webp) are allowed.'
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
  },
  fileFilter,
});

module.exports = upload;
