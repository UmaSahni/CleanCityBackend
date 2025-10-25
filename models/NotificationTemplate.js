// Import mongoose for schema creation
const mongoose = require('mongoose');

// Define NotificationTemplate schema
const notificationTemplateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a template name'],
        unique: true,
        trim: true,
        maxlength: [100, 'Template name cannot be more than 100 characters']
    },
    subject: {
        type: String,
        required: [true, 'Please add a subject'],
        maxlength: [200, 'Subject cannot be more than 200 characters']
    },
    message: {
        type: String,
        required: [true, 'Please add a message'],
        maxlength: [1000, 'Message cannot be more than 1000 characters']
    },
    type: {
        type: String,
        enum: ['email', 'push', 'both'],
        default: 'email'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    // Template variables that can be replaced
    variables: [{
        type: String,
        trim: true
    }],
    // Usage statistics
    usageCount: {
        type: Number,
        default: 0
    },
    lastUsed: {
        type: Date
    },
    // Template category
    category: {
        type: String,
        enum: ['status_update', 'reminder', 'announcement', 'welcome', 'custom'],
        default: 'custom'
    }
}, {
    timestamps: true
});

// Method to increment usage count
notificationTemplateSchema.methods.incrementUsage = function() {
    this.usageCount += 1;
    this.lastUsed = new Date();
    return this.save();
};

// Method to get template with variables replaced
notificationTemplateSchema.methods.getProcessedTemplate = function(variables = {}) {
    let processedSubject = this.subject;
    let processedMessage = this.message;

    // Replace variables in subject and message
    Object.keys(variables).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        processedSubject = processedSubject.replace(regex, variables[key]);
        processedMessage = processedMessage.replace(regex, variables[key]);
    });

    return {
        subject: processedSubject,
        message: processedMessage,
        type: this.type
    };
};

// Export the NotificationTemplate model
module.exports = mongoose.model('NotificationTemplate', notificationTemplateSchema);
