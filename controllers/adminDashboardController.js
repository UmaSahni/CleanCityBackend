// Import required models
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Category = require('../models/Category');
const Notification = require('../models/Notification');

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
const getAdminDashboard = async (req, res, next) => {
    try {
        // Get total complaints
        const totalComplaints = await Complaint.countDocuments();

        // Get complaints by status
        const complaintsByStatus = await Complaint.aggregate([
            {
                $lookup: {
                    from: 'statuses',
                    localField: 'status',
                    foreignField: '_id',
                    as: 'statusInfo'
                }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    statusName: { $first: '$statusInfo.name' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Get complaints by priority
        const complaintsByPriority = await Complaint.aggregate([
            {
                $group: {
                    _id: '$priority',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Get complaints by category
        const complaintsByCategory = await Complaint.aggregate([
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'categoryInfo'
                }
            },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    categoryName: { $first: '$categoryInfo.name' }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        // Get recent complaints (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentComplaints = await Complaint.countDocuments({
            createdAt: { $gte: sevenDaysAgo }
        });

        // Get resolved complaints (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // First get the Resolved status ID
        const Status = require('../models/Status');
        const resolvedStatus = await Status.findOne({ name: 'Resolved' });
        
        const resolvedComplaints = resolvedStatus ? await Complaint.countDocuments({
            status: resolvedStatus._id,
            actualResolutionDate: { $gte: thirtyDaysAgo }
        }) : 0;

        // Get total users
        const totalUsers = await User.countDocuments();

        // Get active users (last 30 days)
        const activeUsers = await User.countDocuments({
            lastActivity: { $gte: thirtyDaysAgo }
        });

        // Get top cities by complaint count
        const topCities = await Complaint.aggregate([
            {
                $group: {
                    _id: '$location.city',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        // Get complaints trend (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const complaintsTrend = await Complaint.aggregate([
            {
                $match: {
                    createdAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Get recent notifications
        const recentNotifications = await Notification.find()
            .populate('recipient', 'name email')
            .populate('complaint', 'title complaintNumber')
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({
            success: true,
            data: {
                overview: {
                    totalComplaints,
                    recentComplaints,
                    resolvedComplaints,
                    totalUsers,
                    activeUsers
                },
                byStatus: complaintsByStatus,
                byPriority: complaintsByPriority,
                byCategory: complaintsByCategory,
                topCities,
                complaintsTrend,
                recentNotifications
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get dashboard charts data
// @route   GET /api/admin/dashboard/charts
// @access  Private (Admin only)
const getDashboardCharts = async (req, res, next) => {
    try {
        const { period = '6months' } = req.query;

        let startDate;
        switch (period) {
            case '1week':
                startDate = new Date();
                startDate.setDate(startDate.getDate() - 7);
                break;
            case '1month':
                startDate = new Date();
                startDate.setMonth(startDate.getMonth() - 1);
                break;
            case '3months':
                startDate = new Date();
                startDate.setMonth(startDate.getMonth() - 3);
                break;
            case '6months':
            default:
                startDate = new Date();
                startDate.setMonth(startDate.getMonth() - 6);
                break;
        }

        // Complaints over time
        const complaintsOverTime = await Complaint.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]);

        // Status distribution
        const statusDistribution = await Complaint.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Priority distribution
        const priorityDistribution = await Complaint.aggregate([
            {
                $group: {
                    _id: '$priority',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Category distribution
        const categoryDistribution = await Complaint.aggregate([
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'categoryInfo'
                }
            },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    categoryName: { $first: '$categoryInfo.name' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                complaintsOverTime,
                statusDistribution,
                priorityDistribution,
                categoryDistribution
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get recent activity
// @route   GET /api/admin/dashboard/activity
// @access  Private (Admin only)
const getRecentActivity = async (req, res, next) => {
    try {
        const { limit = 10 } = req.query;

        // Get recent complaints
        const recentComplaints = await Complaint.find()
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        // Get recent notifications
        const recentNotifications = await Notification.find()
            .populate('recipient', 'name email')
            .populate('complaint', 'title complaintNumber')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            data: {
                recentComplaints,
                recentNotifications
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAdminDashboard,
    getDashboardCharts,
    getRecentActivity
};
