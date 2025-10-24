// Import Express Router
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Import upload controller functions
const {
    uploadImage,
    uploadImages,
    deleteImage,
    getImageDetails
} = require('../controllers/uploadController');

// Import authentication middleware
const { protect } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Directory to save uploaded files temporarily
    },
    filename: function (req, file, cb) {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter to allow only image files
const fileFilter = (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// Configure multer with limits
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 5 // Maximum 5 files for multiple upload
    }
});

// Define upload routes
router.route('/image')
    .post(protect, upload.single('image'), uploadImage); // POST /api/upload/image

router.route('/images')
    .post(protect, upload.array('images', 5), uploadImages); // POST /api/upload/images

router.route('/image/:publicId')
    .get(protect, getImageDetails) // GET /api/upload/image/:publicId
    .delete(protect, deleteImage); // DELETE /api/upload/image/:publicId

// Export the router
module.exports = router;
