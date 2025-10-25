// Import mongoose for schema creation
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define User schema
const userSchema = new mongoose.Schema({
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
        select: false // Don't include password in queries by default
    },
    age: {
        type: Number,
        min: [1, 'Age must be at least 1'],
        max: [120, 'Age cannot be more than 120']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    role: {
        type: String,
        enum: ['citizen', 'admin', 'super_admin'],
        default: 'citizen'
    },
    // Admin-specific fields
    adminPermissions: [{
        type: String,
        enum: ['manage_complaints', 'manage_categories', 'manage_users', 'view_analytics', 'manage_settings']
    }],
    // Profile information
    phone: {
        type: String,
        match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
    },
    address: {
        street: String,
        city: String,
        state: String,
        pincode: String
    },
    // User statistics
    complaintsSubmitted: {
        type: Number,
        default: 0
    },
    complaintsResolved: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true // Automatically add createdAt and updatedAt fields
});

// Encrypt password using bcrypt before saving
userSchema.pre('save', async function (next) {
    // Only run this function if password was actually modified
    if (!this.isModified('password')) {
        next();
    }

    // Hash the password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Export the User model
module.exports = mongoose.model('User', userSchema);
