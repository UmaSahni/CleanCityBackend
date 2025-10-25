// Import mongoose for schema creation
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define Admin schema
const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        lowercase: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    role: {
        type: String,
        enum: ['admin', 'super_admin'],
        default: 'admin'
    },
    permissions: [{
        type: String,
        enum: [
            'manage_complaints',
            'manage_users', 
            'manage_categories',
            'manage_notifications',
            'view_analytics',
            'manage_settings',
            'manage_resolved'
        ]
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    },
    profile: {
        phone: {
            type: String,
            match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
        },
        department: {
            type: String,
            maxlength: [50, 'Department name cannot be more than 50 characters']
        },
        avatar: {
            type: String
        }
    },
    // Admin statistics
    complaintsAssigned: {
        type: Number,
        default: 0
    },
    complaintsResolved: {
        type: Number,
        default: 0
    },
    notificationsSent: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Encrypt password using bcrypt before saving
adminSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Match user entered password to hashed password in database
adminSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Method to update last login
adminSchema.methods.updateLastLogin = function() {
    this.lastLogin = new Date();
    return this.save();
};

// Export the Admin model
module.exports = mongoose.model('Admin', adminSchema);
