// Import required models
const Notification = require('../models/Notification');
const NotificationTemplate = require('../models/NotificationTemplate');
const User = require('../models/User');
const Complaint = require('../models/Complaint');

// @desc    Get all notification templates
// @route   GET /api/admin/notifications/templates
// @access  Private (Admin only)
const getNotificationTemplates = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, category, isActive } = req.query;

        const filter = {};
        if (category) filter.category = category;
        if (isActive !== undefined) filter.isActive = isActive === 'true';

        const skip = (page - 1) * limit;

        const templates = await NotificationTemplate.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await NotificationTemplate.countDocuments(filter);

        res.status(200).json({
            success: true,
            count: templates.length,
            total,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            },
            data: templates
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create notification template
// @route   POST /api/admin/notifications/templates
// @access  Private (Admin only)
const createNotificationTemplate = async (req, res, next) => {
    try {
        const { name, subject, message, type, category, variables } = req.body;

        const template = await NotificationTemplate.create({
            name,
            subject,
            message,
            type,
            category,
            variables
        });

        res.status(201).json({
            success: true,
            message: 'Notification template created successfully',
            data: template
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update notification template
// @route   PUT /api/admin/notifications/templates/:id
// @access  Private (Admin only)
const updateNotificationTemplate = async (req, res, next) => {
    try {
        const template = await NotificationTemplate.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Notification template not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Notification template updated successfully',
            data: template
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete notification template
// @route   DELETE /api/admin/notifications/templates/:id
// @access  Private (Admin only)
const deleteNotificationTemplate = async (req, res, next) => {
    try {
        const template = await NotificationTemplate.findByIdAndDelete(req.params.id);

        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Notification template not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Notification template deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get notification history
// @route   GET /api/admin/notifications/history
// @access  Private (Admin only)
const getNotificationHistory = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, status, type, recipient } = req.query;

        const filter = {};
        if (status) filter.status = status;
        if (type) filter.type = type;
        if (recipient) filter.recipient = recipient;

        const skip = (page - 1) * limit;

        const notifications = await Notification.find(filter)
            .populate('recipient', 'name email')
            .populate('complaint', 'title complaintNumber')
            .populate('template', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Notification.countDocuments(filter);

        res.status(200).json({
            success: true,
            count: notifications.length,
            total,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            },
            data: notifications
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Send notification
// @route   POST /api/admin/notifications/send
// @access  Private (Admin only)
const sendNotification = async (req, res, next) => {
    try {
        const { 
            recipients, 
            templateId, 
            title, 
            message, 
            type = 'email',
            complaintId 
        } = req.body;

        let notificationData = {
            title,
            message,
            type
        };

        // If template is provided, get processed template
        if (templateId) {
            const template = await NotificationTemplate.findById(templateId);
            if (!template) {
                return res.status(404).json({
                    success: false,
                    message: 'Notification template not found'
                });
            }

            const processedTemplate = template.getProcessedTemplate();
            notificationData = {
                ...notificationData,
                ...processedTemplate,
                template: templateId
            };

            // Increment template usage
            await template.incrementUsage();
        }

        // If complaint is provided, add it to notification data
        if (complaintId) {
            notificationData.complaint = complaintId;
        }

        // Create notifications for each recipient
        const notifications = [];
        for (const recipientId of recipients) {
            const notification = new Notification({
                ...notificationData,
                recipient: recipientId
            });
            
            await notification.save();
            notifications.push(notification);
        }

        res.status(201).json({
            success: true,
            message: `Sent ${notifications.length} notifications successfully`,
            data: notifications
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get notification statistics
// @route   GET /api/admin/notifications/stats
// @access  Private (Admin only)
const getNotificationStats = async (req, res, next) => {
    try {
        // Get total notifications
        const totalNotifications = await Notification.countDocuments();

        // Get notifications by status
        const notificationsByStatus = await Notification.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get notifications by type
        const notificationsByType = await Notification.aggregate([
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get recent notifications (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentNotifications = await Notification.countDocuments({
            createdAt: { $gte: sevenDaysAgo }
        });

        // Get failed notifications
        const failedNotifications = await Notification.countDocuments({
            status: 'failed'
        });

        res.status(200).json({
            success: true,
            data: {
                overview: {
                    totalNotifications,
                    recentNotifications,
                    failedNotifications
                },
                byStatus: notificationsByStatus,
                byType: notificationsByType
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getNotificationTemplates,
    createNotificationTemplate,
    updateNotificationTemplate,
    deleteNotificationTemplate,
    getNotificationHistory,
    sendNotification,
    getNotificationStats
};
