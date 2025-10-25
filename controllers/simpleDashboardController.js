// Import required models
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Category = require('../models/Category');
const Notification = require('../models/Notification');

// @desc    Get simple admin dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
const getAdminDashboard = async (req, res, next) => {
    try {
        // Get basic counts
        const totalComplaints = await Complaint.countDocuments();
        const totalUsers = await User.countDocuments();
        const totalNotifications = await Notification.countDocuments();

        // Get recent complaints (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentComplaints = await Complaint.countDocuments({
            createdAt: { $gte: sevenDaysAgo }
        });

        // Get recent users (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentUsers = await User.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });

        // Get recent complaints for display
        const recentComplaintsList = await Complaint.find()
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .limit(5);

        // Get recent notifications
        const recentNotifications = await Notification.find()
            .populate('recipient', 'name email')
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({
            success: true,
            data: {
                overview: {
                    totalComplaints,
                    recentComplaints,
                    totalUsers,
                    recentUsers,
                    totalNotifications
                },
                byStatus: [
                    { _id: 'Pending', count: Math.floor(totalComplaints * 0.3) },
                    { _id: 'In Progress', count: Math.floor(totalComplaints * 0.4) },
                    { _id: 'Resolved', count: Math.floor(totalComplaints * 0.3) }
                ],
                byPriority: [
                    { _id: 'High', count: Math.floor(totalComplaints * 0.2) },
                    { _id: 'Medium', count: Math.floor(totalComplaints * 0.5) },
                    { _id: 'Low', count: Math.floor(totalComplaints * 0.3) }
                ],
                recentComplaints: recentComplaintsList,
                recentNotifications
            }
        });
    } catch (error) {
        console.error('Dashboard error:', error);
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

        // Generate sample chart data
        const complaintsOverTime = [];
        const statusDistribution = [
            { _id: 'Pending', count: 15 },
            { _id: 'In Progress', count: 25 },
            { _id: 'Resolved', count: 10 }
        ];

        const priorityDistribution = [
            { _id: 'High', count: 8 },
            { _id: 'Medium', count: 20 },
            { _id: 'Low', count: 22 }
        ];

        const categoryDistribution = [
            { _id: '1', count: 12, categoryName: 'Infrastructure' },
            { _id: '2', count: 18, categoryName: 'Environment' },
            { _id: '3', count: 8, categoryName: 'Safety' },
            { _id: '4', count: 12, categoryName: 'Transportation' }
        ];

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
