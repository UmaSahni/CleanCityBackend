// Import mongoose for schema creation
const mongoose = require('mongoose');

// Define Complaint schema
const complaintSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a complaint title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please add a complaint description'],
        maxlength: [1000, 'Description cannot be more than 1000 characters']
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Please select a category']
    },
    status: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Status',
        required: [true, 'Please select a status']
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium'
    },
    // Location information
    location: {
        lat: {
            type: Number,
            required: [true, 'Please provide latitude'],
            min: [-90, 'Latitude must be between -90 and 90'],
            max: [90, 'Latitude must be between -90 and 90']
        },
        lng: {
            type: Number,
            required: [true, 'Please provide longitude'],
            min: [-180, 'Longitude must be between -180 and 180'],
            max: [180, 'Longitude must be between -180 and 180']
        },
        address: {
            type: String,
            required: [true, 'Please provide address'],
            maxlength: [200, 'Address cannot be more than 200 characters']
        },
        // Additional location details
        city: {
            type: String,
            required: [true, 'Please provide city'],
            maxlength: [50, 'City name cannot be more than 50 characters']
        },
        state: {
            type: String,
            required: [true, 'Please provide state'],
            maxlength: [50, 'State name cannot be more than 50 characters']
        },
        pincode: {
            type: String,
            required: [true, 'Please provide pincode'],
            match: [/^[0-9]{6}$/, 'Please provide a valid 6-digit pincode']
        }
    },
    // Photo attachments
    photos: [{
        url: {
            type: String,
            required: true
        },
        publicId: {
            type: String,
            required: true
        },
        caption: {
            type: String,
            maxlength: [100, 'Caption cannot be more than 100 characters']
        }
    }],
    // User references
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide user ID']
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    // Resolution information
    resolutionNotes: {
        type: String,
        maxlength: [500, 'Resolution notes cannot be more than 500 characters']
    },
    estimatedResolutionDate: {
        type: Date
    },
    actualResolutionDate: {
        type: Date
    },
    // Complaint tracking
    complaintNumber: {
        type: String,
        unique: true,
        required: true
    },
    // Visibility settings
    isPublic: {
        type: Boolean,
        default: true
    },
    isAnonymous: {
        type: Boolean,
        default: false
    },
    // Status history for tracking changes
    statusHistory: [{
        status: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Status',
            required: true
        },
        changedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        changedAt: {
            type: Date,
            default: Date.now
        },
        notes: {
            type: String,
            maxlength: [200, 'Status change notes cannot be more than 200 characters']
        }
    }],
    // Additional metadata
    tags: [{
        type: String,
        trim: true,
        maxlength: [20, 'Tag cannot be more than 20 characters']
    }],
    // Complaint statistics
    viewCount: {
        type: Number,
        default: 0
    },
    upvotes: {
        type: Number,
        default: 0
    },
    downvotes: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true // Automatically add createdAt and updatedAt fields
});

// Indexes for better query performance
complaintSchema.index({ userId: 1 });
complaintSchema.index({ category: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ priority: 1 });
complaintSchema.index({ 'location.city': 1 });
complaintSchema.index({ 'location.state': 1 });
complaintSchema.index({ createdAt: -1 });
complaintSchema.index({ complaintNumber: 1 });

// Geospatial index for location-based queries
complaintSchema.index({ 'location.lat': 1, 'location.lng': 1 });

// Pre-save middleware to generate complaint number
complaintSchema.pre('save', async function (next) {
    if (this.isNew && !this.complaintNumber) {
        // Generate complaint number: CC + YYYY + MM + DD + 4-digit sequence
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');

        // Get count of complaints created today
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

        const count = await this.constructor.countDocuments({
            createdAt: { $gte: todayStart, $lt: todayEnd }
        });

        const sequence = String(count + 1).padStart(4, '0');
        this.complaintNumber = `CC${year}${month}${day}${sequence}`;
    }
    next();
});

// Method to add status change to history
complaintSchema.methods.addStatusChange = function (statusId, changedBy, notes = '') {
    this.statusHistory.push({
        status: statusId,
        changedBy: changedBy,
        changedAt: new Date(),
        notes: notes
    });
    return this.save();
};

// Method to get complaint summary for public display
complaintSchema.methods.getPublicSummary = function () {
    return {
        id: this._id,
        title: this.title,
        description: this.description,
        category: this.category,
        status: this.status,
        priority: this.priority,
        location: {
            address: this.location.address,
            city: this.location.city,
            state: this.location.state
        },
        photos: this.photos,
        complaintNumber: this.complaintNumber,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        viewCount: this.viewCount,
        upvotes: this.upvotes,
        downvotes: this.downvotes
    };
};

// Export the Complaint model
module.exports = mongoose.model('Complaint', complaintSchema);
