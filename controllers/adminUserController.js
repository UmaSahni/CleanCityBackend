// Import required models
const User = require('../models/User');
const Complaint = require('../models/Complaint');

// @desc    Get all users for admin
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getAllUsers = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            isActive,
            sort = '-createdAt'
        } = req.query;

        // Build filter object
        const filter = {};

        if (isActive !== undefined) filter.isActive = isActive === 'true';

        // Search functionality
        if (search) {
            filter.$or = [
                { name: new RegExp(search, 'i') },
                { email: new RegExp(search, 'i') }
            ];
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Get users with pagination
        const users = await User.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count
        const total = await User.countDocuments(filter);

        // Get user statistics
        const usersWithStats = await Promise.all(
            users.map(async (user) => {
                const complaintsCount = await Complaint.countDocuments({ userId: user._id });
                // Note: We'll get resolved count differently since status is an ObjectId
                const resolvedCount = 0; // Simplified for now

                return {
                    ...user.toObject(),
                    complaintsCount,
                    resolvedCount
                };
            })
        );

        res.status(200).json({
            success: true,
            count: users.length,
            total,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            },
            data: usersWithStats
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single user for admin
// @route   GET /api/admin/users/:id
// @access  Private (Admin only)
const getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get user's complaints
        const complaints = await Complaint.find({ userId: user._id })
            .sort({ createdAt: -1 })
            .limit(10);

        // Get user statistics
        const totalComplaints = await Complaint.countDocuments({ userId: user._id });
        // Note: Simplified since status is an ObjectId reference
        const resolvedComplaints = 0; // Simplified for now
        const pendingComplaints = 0; // Simplified for now

        res.status(200).json({
            success: true,
            data: {
                user,
                statistics: {
                    totalComplaints,
                    resolvedComplaints,
                    pendingComplaints
                },
                recentComplaints: complaints
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin only)
const updateUserStatus = async (req, res, next) => {
    try {
        const { isActive } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isActive },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get user statistics
// @route   GET /api/admin/users/stats
// @access  Private (Admin only)
const getUserStats = async (req, res, next) => {
    try {
        // Get total users
        const totalUsers = await User.countDocuments();

        // Get active users
        const activeUsers = await User.countDocuments({ isActive: true });

        // Get inactive users
        const inactiveUsers = await User.countDocuments({ isActive: false });

        // Get users by role
        const usersByRole = await User.aggregate([
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get users registered in last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentUsers = await User.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });

        // Get top users by complaints
        const topUsersByComplaints = await User.aggregate([
            {
                $lookup: {
                    from: 'complaints',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'complaints'
                }
            },
            {
                $project: {
                    name: 1,
                    email: 1,
                    complaintsCount: { $size: '$complaints' }
                }
            },
            { $sort: { complaintsCount: -1 } },
            { $limit: 10 }
        ]);

        res.status(200).json({
            success: true,
            data: {
                overview: {
                    totalUsers,
                    activeUsers,
                    inactiveUsers,
                    recentUsers
                },
                byRole: usersByRole,
                topUsersByComplaints
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get user's complaints
// @route   GET /api/admin/users/:id/complaints
// @access  Private (Admin only)
const getUserComplaints = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const userId = req.params.id;

        const filter = { userId };
        if (status) filter.status = status;

        const skip = (page - 1) * limit;

        const complaints = await Complaint.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Complaint.countDocuments(filter);

        res.status(200).json({
            success: true,
            count: complaints.length,
            total,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            },
            data: complaints
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllUsers,
    getUser,
    updateUserStatus,
    getUserStats,
    getUserComplaints
};
