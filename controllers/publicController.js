// Import required models
const Complaint = require('../models/Complaint');
const Category = require('../models/Category');
const Status = require('../models/Status');

// @desc    Get public complaints (resolved and in progress)
// @route   GET /api/public/complaints
// @access  Public
const getPublicComplaints = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            category,
            city,
            state,
            sort = '-createdAt'
        } = req.query;

        // Build filter object - show all public complaints regardless of status
        const filter = {
            isPublic: true
        };

        if (category) filter.category = category;
        if (city) filter['location.city'] = new RegExp(city, 'i');
        if (state) filter['location.state'] = new RegExp(state, 'i');

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Get complaints with pagination
        const complaints = await Complaint.find(filter)
            .populate('category', 'name description icon color')
            .populate('status', 'name description color icon order')
            .select('-statusHistory -resolutionNotes -adminId')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count
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

// @desc    Get public statistics
// @route   GET /api/public/stats
// @access  Public
const getPublicStats = async (req, res, next) => {
    try {
        // Get total public complaints
        const totalComplaints = await Complaint.countDocuments({ isPublic: true });

        // Get resolved complaints count
        const resolvedStatus = await Status.findOne({ name: 'Resolved' });
        const resolvedComplaints = await Complaint.countDocuments({
            status: resolvedStatus._id,
            isPublic: true
        });

        // Get complaints by category (public only)
        const complaintsByCategory = await Complaint.aggregate([
            { $match: { isPublic: true } },
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
                    categoryName: { $first: '$categoryInfo.name' },
                    categoryColor: { $first: '$categoryInfo.color' },
                    categoryIcon: { $first: '$categoryInfo.icon' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Get complaints by status (public only)
        const complaintsByStatus = await Complaint.aggregate([
            { $match: { isPublic: true } },
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
                    statusName: { $first: '$statusInfo.name' },
                    statusColor: { $first: '$statusInfo.color' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Get recent activity (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentActivity = await Complaint.countDocuments({
            isPublic: true,
            createdAt: { $gte: thirtyDaysAgo }
        });

        // Get top cities by complaint count
        const topCities = await Complaint.aggregate([
            { $match: { isPublic: true } },
            {
                $group: {
                    _id: '$location.city',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Calculate resolution rate
        const resolutionRate = totalComplaints > 0
            ? Math.round((resolvedComplaints / totalComplaints) * 100)
            : 0;

        res.status(200).json({
            success: true,
            data: {
                overview: {
                    total: totalComplaints,
                    resolved: resolvedComplaints,
                    resolutionRate: resolutionRate,
                    recentActivity: recentActivity
                },
                byCategory: complaintsByCategory,
                byStatus: complaintsByStatus,
                topCities: topCities
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get complaint categories for public
// @route   GET /api/public/categories
// @access  Public
const getPublicCategories = async (req, res, next) => {
    try {
        const categories = await Category.find({ isActive: true })
            .select('name description icon color complaintCount')
            .sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single public complaint
// @route   GET /api/public/complaints/:id
// @access  Public
const getPublicComplaint = async (req, res, next) => {
    try {
        const complaint = await Complaint.findById(req.params.id)
            .populate('category', 'name description icon color')
            .populate('status', 'name description color icon order')
            .select('-statusHistory -resolutionNotes -adminId -userId');

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }

        // Check if complaint is public
        if (!complaint.isPublic) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }

        // Increment view count
        await Complaint.findByIdAndUpdate(req.params.id, {
            $inc: { viewCount: 1 }
        });

        res.status(200).json({
            success: true,
            data: complaint
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Search public complaints
// @route   GET /api/public/search
// @access  Public
const searchPublicComplaints = async (req, res, next) => {
    try {
        const {
            q, // search query
            page = 1,
            limit = 10,
            category,
            city,
            state
        } = req.query;

        if (!q) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a search query'
            });
        }

        // Get resolved and in progress statuses
        const publicStatuses = await Status.find({
            name: { $in: ['Resolved', 'In Progress'] }
        });

        const statusIds = publicStatuses.map(status => status._id);

        // Build search filter
        const filter = {
            status: { $in: statusIds },
            isPublic: true,
            $or: [
                { title: new RegExp(q, 'i') },
                { description: new RegExp(q, 'i') },
                { complaintNumber: new RegExp(q, 'i') },
                { tags: { $in: [new RegExp(q, 'i')] } }
            ]
        };

        if (category) filter.category = category;
        if (city) filter['location.city'] = new RegExp(city, 'i');
        if (state) filter['location.state'] = new RegExp(state, 'i');

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Search complaints
        const complaints = await Complaint.find(filter)
            .populate('category', 'name description icon color')
            .populate('status', 'name description color icon order')
            .select('-statusHistory -resolutionNotes -adminId -userId')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count
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
    getPublicComplaints,
    getPublicStats,
    getPublicCategories,
    getPublicComplaint,
    searchPublicComplaints
};
