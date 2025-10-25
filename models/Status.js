// Import mongoose for schema creation
const mongoose = require('mongoose');

// Define Status schema
const statusSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a status name'],
        unique: true,
        trim: true,
        maxlength: [30, 'Status name cannot be more than 30 characters']
    },
    description: {
        type: String,
        required: [true, 'Please add a status description'],
        maxlength: [100, 'Description cannot be more than 100 characters']
    },
    order: {
        type: Number,
        required: [true, 'Please add an order number for workflow'],
        unique: true,
        min: [1, 'Order must be at least 1']
    },
    color: {
        type: String,
        required: [true, 'Please add a color for the status'],
        default: '#6B7280',
        match: [/^#[0-9A-F]{6}$/i, 'Please add a valid hex color']
    },
    icon: {
        type: String,
        required: [true, 'Please add an icon for the status'],
        default: 'fas fa-clock'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    // Whether this status is final (e.g., Resolved, Rejected)
    isFinal: {
        type: Boolean,
        default: false
    },
    // Whether this status requires admin action
    requiresAdminAction: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true // Automatically add createdAt and updatedAt fields
});

// Index for better query performance
statusSchema.index({ order: 1 });
statusSchema.index({ isActive: 1 });
statusSchema.index({ isFinal: 1 });

// Export the Status model
module.exports = mongoose.model('Status', statusSchema);
