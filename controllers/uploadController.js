// Import required modules
const cloudinary = require('../config/cloudinary');

// @desc    Upload single image
// @route   POST /api/upload/image
// @access  Private
const uploadImage = async (req, res, next) => {
    try {
        // Check if file exists
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        // Upload file to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'hackapp', // Folder name in Cloudinary
            resource_type: 'auto', // Automatically detect file type
            quality: 'auto', // Automatic quality optimization
            fetch_format: 'auto', // Automatic format optimization
            upload_preset: 'cleancity' // Use the cleancity preset from Cloudinary dashboard
        });

        // Return success response with image details
        res.status(200).json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                public_id: result.public_id,
                secure_url: result.secure_url,
                width: result.width,
                height: result.height,
                format: result.format,
                bytes: result.bytes,
                created_at: result.created_at
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading image',
            error: error.message
        });
    }
};

// @desc    Upload multiple images
// @route   POST /api/upload/images
// @access  Private
const uploadImages = async (req, res, next) => {
    try {
        // Check if files exist
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files uploaded'
            });
        }

        const uploadPromises = req.files.map(file =>
            cloudinary.uploader.upload(file.path, {
                folder: 'hackapp',
                resource_type: 'auto',
                quality: 'auto',
                fetch_format: 'auto',
                upload_preset: 'cleancity' // Use the cleancity preset from Cloudinary dashboard
            })
        );

        // Wait for all uploads to complete
        const results = await Promise.all(uploadPromises);

        // Format results
        const uploadedImages = results.map(result => ({
            public_id: result.public_id,
            secure_url: result.secure_url,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
            created_at: result.created_at
        }));

        // Return success response
        res.status(200).json({
            success: true,
            message: `${uploadedImages.length} images uploaded successfully`,
            data: uploadedImages
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading images',
            error: error.message
        });
    }
};

// @desc    Delete image from Cloudinary
// @route   DELETE /api/upload/image/:publicId
// @access  Private
const deleteImage = async (req, res, next) => {
    try {
        const { publicId } = req.params;

        // Delete image from Cloudinary
        const result = await cloudinary.uploader.destroy(publicId);

        if (result.result === 'ok') {
            res.status(200).json({
                success: true,
                message: 'Image deleted successfully'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Image not found'
            });
        }
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting image',
            error: error.message
        });
    }
};

// @desc    Get image details
// @route   GET /api/upload/image/:publicId
// @access  Private
const getImageDetails = async (req, res, next) => {
    try {
        const { publicId } = req.params;

        // Get image details from Cloudinary
        const result = await cloudinary.api.resource(publicId);

        res.status(200).json({
            success: true,
            data: {
                public_id: result.public_id,
                secure_url: result.secure_url,
                width: result.width,
                height: result.height,
                format: result.format,
                bytes: result.bytes,
                created_at: result.created_at,
                tags: result.tags
            }
        });
    } catch (error) {
        console.error('Get image error:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting image details',
            error: error.message
        });
    }
};

module.exports = {
    uploadImage,
    uploadImages,
    deleteImage,
    getImageDetails
};
