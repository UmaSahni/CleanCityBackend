// Import cloudinary library
const cloudinary = require('cloudinary').v2;

// Configure cloudinary with environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dnd6b7lfn',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Export cloudinary instance
module.exports = cloudinary;
