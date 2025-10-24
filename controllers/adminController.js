// Import required models
const Complaint = require('../models/Complaint');
const Category = require('../models/Category');
const Status = require('../models/Status');
const User = require('../models/User');

// @desc    Get all complaints (admin view)
// @route   GET /api/admin/complaints
// @access  Private (Admin only)
const getAllComplaints = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            category,
            priority,
            city,
            state,
            sort = '-createdAt',
            search
        } = req.query;

        // Build filter object
        const filter = {};

        if (status) filter.status = status;
        if (category) filter.category = category;
        if (priority) filter.priority = priority;
        if (city) filter['location.city'] = new RegExp(city, 'i');
        if (state) filter['location.state'] = new RegExp(state, 'i');

        // Search functionality
        if (search) {
            filter.$or = [
                { title: new RegExp(search, 'i') },
                { description: new RegExp(search, 'i') },
                { complaintNumber: new RegExp(search, 'i') }
            ];
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Get complaints with pagination
        const complaints = await Complaint.find(filter)
            .populate('category', 'name description icon color')
            .populate('status', 'name description color icon order')
            .populate('userId', 'name email phone')
            .populate('adminId', 'name email')
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

// @desc    Update complaint status (admin)
// @route   PUT /api/admin/complaints/:id/status
// @access  Private (Admin only)
const updateComplaintStatus = async (req, res, next) => {
    try {
        const { status, notes, estimatedResolutionDate } = req.body;
        const complaintId = req.params.id;

        // Validate status
        const newStatus = await Status.findById(status);
        if (!newStatus) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        // Get complaint
        const complaint = await Complaint.findById(complaintId);
        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }

        // Update complaint status
        const updatedComplaint = await Complaint.findByIdAndUpdate(
            complaintId,
            {
                status,
                adminId: req.user.id,
                resolutionNotes: notes || complaint.resolutionNotes,
                estimatedResolutionDate: estimatedResolutionDate || complaint.estimatedResolutionDate
            },
            { new: true, runValidators: true }
        );

        // Add status change to history
        await updatedComplaint.addStatusChange(status, req.user.id, notes || '');

        // If status is resolved, set actual resolution date
        if (newStatus.name === 'Resolved') {
            await Complaint.findByIdAndUpdate(complaintId, {
                actualResolutionDate: new Date()
            });
        }

        // Populate the updated complaint
        const populatedComplaint = await Complaint.findById(complaintId)
            .populate('category', 'name description icon color')
            .populate('status', 'name description color icon order')
            .populate('userId', 'name email phone')
            .populate('adminId', 'name email')
            .populate('statusHistory.status', 'name description color icon')
            .populate('statusHistory.changedBy', 'name email role');

        res.status(200).json({
            success: true,
            message: 'Complaint status updated successfully',
            data: populatedComplaint
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Assign complaint to admin
// @route   PUT /api/admin/complaints/:id/assign
// @access  Private (Admin only)
const assignComplaint = async (req, res, next) => {
    try {
        const { adminId } = req.body;
        const complaintId = req.params.id;

        // Check if assigned admin exists and has admin role
        const admin = await User.findById(adminId);
        if (!admin || !['admin', 'super_admin'].includes(admin.role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid admin user'
            });
        }

        // Update complaint assignment
        const updatedComplaint = await Complaint.findByIdAndUpdate(
            complaintId,
            { adminId },
            { new: true, runValidators: true }
        )
            .populate('category', 'name description icon color')
            .populate('status', 'name description color icon order')
            .populate('userId', 'name email phone')
            .populate('adminId', 'name email role');

        if (!updatedComplaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Complaint assigned successfully',
            data: updatedComplaint
        });
    } catch (error) {
        next(error);
    }
};

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
                    statusName: { $first: '$statusInfo.name' },
                    statusColor: { $first: '$statusInfo.color' }
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
                    categoryName: { $first: '$categoryInfo.name' },
                    categoryColor: { $first: '$categoryInfo.color' }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
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

        // Get recent complaints (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentComplaints = await Complaint.countDocuments({
            createdAt: { $gte: sevenDaysAgo }
        });

        // Get resolved complaints (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const resolvedStatus = await Status.findOne({ name: 'Resolved' });
        const resolvedComplaints = await Complaint.countDocuments({
            status: resolvedStatus._id,
            actualResolutionDate: { $gte: thirtyDaysAgo }
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

        res.status(200).json({
            success: true,
            data: {
                overview: {
                    total: totalComplaints,
                    recent: recentComplaints,
                    resolved: resolvedComplaints
                },
                byStatus: complaintsByStatus,
                byCategory: complaintsByCategory,
                byPriority: complaintsByPriority,
                topCities: topCities
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get complaint details for admin
// @route   GET /api/admin/complaints/:id
// @access  Private (Admin only)
const getComplaintForAdmin = async (req, res, next) => {
    try {
        const complaint = await Complaint.findById(req.params.id)
            .populate('category', 'name description icon color')
            .populate('status', 'name description color icon order')
            .populate('userId', 'name email phone role')
            .populate('adminId', 'name email role')
            .populate('statusHistory.status', 'name description color icon')
            .populate('statusHistory.changedBy', 'name email role');

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }

        res.status(200).json({
            success: true,
            data: complaint
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllComplaints,
    updateComplaintStatus,
    assignComplaint,
    getAdminDashboard,
    getComplaintForAdmin
};
