// Import mongoose for schema creation
const mongoose = require('mongoose');

// Define Notification schema
const notificationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a notification title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    message: {
        type: String,
        required: [true, 'Please add a notification message'],
        maxlength: [500, 'Message cannot be more than 500 characters']
    },
    type: {
        type: String,
        enum: ['email', 'push', 'both'],
        default: 'email'
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide recipient']
    },
    complaint: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Complaint'
    },
    status: {
        type: String,
        enum: ['pending', 'sent', 'failed', 'delivered'],
        default: 'pending'
    },
    sentAt: {
        type: Date
    },
    deliveredAt: {
        type: Date
    },
    // Notification template reference
    template: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'NotificationTemplate'
    },
    // Additional data for personalization
    data: {
        type: mongoose.Schema.Types.Mixed
    },
    // Error information if sending failed
    error: {
        message: String,
        code: String,
        timestamp: Date
    }
}, {
    timestamps: true
});

// Indexes for better query performance
notificationSchema.index({ recipient: 1 });
notificationSchema.index({ status: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ complaint: 1 });

// Method to mark as sent
notificationSchema.methods.markAsSent = function() {
    this.status = 'sent';
    this.sentAt = new Date();
    return this.save();
};

// Method to mark as delivered
notificationSchema.methods.markAsDelivered = function() {
    this.status = 'delivered';
    this.deliveredAt = new Date();
    return this.save();
};

// Method to mark as failed
notificationSchema.methods.markAsFailed = function(error) {
    this.status = 'failed';
    this.error = {
        message: error.message,
        code: error.code,
        timestamp: new Date()
    };
    return this.save();
};

// Export the Notification model
module.exports = mongoose.model('Notification', notificationSchema);
