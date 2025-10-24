// Import mongoose for schema creation
const mongoose = require('mongoose');

// Define Category schema
const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a category name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Category name cannot be more than 50 characters']
    },
    description: {
        type: String,
        required: [true, 'Please add a category description'],
        maxlength: [200, 'Description cannot be more than 200 characters']
    },
    icon: {
        type: String,
        required: [true, 'Please add an icon for the category'],
        default: 'fas fa-exclamation-circle'
    },
    color: {
        type: String,
        required: [true, 'Please add a color for the category'],
        default: '#3B82F6',
        match: [/^#[0-9A-F]{6}$/i, 'Please add a valid hex color']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    // Count of complaints in this category (for statistics)
    complaintCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true // Automatically add createdAt and updatedAt fields
});

// Index for better query performance
categorySchema.index({ name: 1 });
categorySchema.index({ isActive: 1 });

// Export the Category model
module.exports = mongoose.model('Category', categorySchema);
