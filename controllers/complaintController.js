// Import required models
const Complaint = require('../models/Complaint');
const Category = require('../models/Category');
const Status = require('../models/Status');
const User = require('../models/User');

// @desc    Create new complaint
// @route   POST /api/complaints
// @access  Private
const createComplaint = async (req, res, next) => {
    try {
        const {
            title,
            description,
            category,
            priority,
            location,
            photos,
            tags,
            isAnonymous
        } = req.body;

        // Validate required fields
        if (!title || !description || !category || !location) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Check if category exists
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category'
            });
        }

        // Get initial status (Submitted)
        const initialStatus = await Status.findOne({ name: 'Submitted' });
        if (!initialStatus) {
            return res.status(500).json({
                success: false,
                message: 'Initial status not found'
            });
        }

        // Create complaint
        const complaint = await Complaint.create({
            title,
            description,
            category,
            status: initialStatus._id,
            priority: priority || 'Medium',
            location,
            photos: photos || [],
            tags: tags || [],
            userId: req.user.id,
            isAnonymous: isAnonymous || false
        });

        // Add initial status to history
        await complaint.addStatusChange(initialStatus._id, req.user.id, 'Complaint submitted');

        // Update user statistics
        await User.findByIdAndUpdate(req.user.id, {
            $inc: { complaintsSubmitted: 1 }
        });

        // Update category complaint count
        await Category.findByIdAndUpdate(category, {
            $inc: { complaintCount: 1 }
        });

        // Populate the complaint with related data
        const populatedComplaint = await Complaint.findById(complaint._id)
            .populate('category', 'name description icon color')
            .populate('status', 'name description color icon')
            .populate('userId', 'name email role')
            .select('-statusHistory');

        res.status(201).json({
            success: true,
            message: 'Complaint created successfully',
            data: populatedComplaint
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get user's complaints
// @route   GET /api/complaints
// @access  Private
const getUserComplaints = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            category,
            priority,
            sort = '-createdAt'
        } = req.query;

        // Build filter object
        const filter = { userId: req.user.id };

        if (status) filter.status = status;
        if (category) filter.category = category;
        if (priority) filter.priority = priority;

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Get complaints with pagination
        const complaints = await Complaint.find(filter)
            .populate('category', 'name description icon color')
            .populate('status', 'name description color icon order')
            .populate('adminId', 'name email')
            .select('-statusHistory')
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

// @desc    Get single complaint
// @route   GET /api/complaints/:id
// @access  Private
const getComplaint = async (req, res, next) => {
    try {
        const complaint = await Complaint.findById(req.params.id)
            .populate('category', 'name description icon color')
            .populate('status', 'name description color icon order')
            .populate('userId', 'name email role')
            .populate('adminId', 'name email role')
            .populate('statusHistory.status', 'name description color icon')
            .populate('statusHistory.changedBy', 'name email role');

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }

        // Check if user owns the complaint or is admin
        if (complaint.userId._id.toString() !== req.user.id && req.user.role === 'citizen') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this complaint'
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

// @desc    Update complaint (user can only update their own)
// @route   PUT /api/complaints/:id
// @access  Private
const updateComplaint = async (req, res, next) => {
    try {
        const {
            title,
            description,
            priority,
            location,
            photos,
            tags
        } = req.body;

        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }

        // Check if user owns the complaint
        if (complaint.userId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this complaint'
            });
        }

        // Check if complaint can be updated (only if status is Submitted or Under Review)
        const status = await Status.findById(complaint.status);
        if (status.name !== 'Submitted' && status.name !== 'Under Review') {
            return res.status(400).json({
                success: false,
                message: 'Complaint cannot be updated in current status'
            });
        }

        // Update complaint
        const updatedComplaint = await Complaint.findByIdAndUpdate(
            req.params.id,
            {
                title: title || complaint.title,
                description: description || complaint.description,
                priority: priority || complaint.priority,
                location: location || complaint.location,
                photos: photos || complaint.photos,
                tags: tags || complaint.tags
            },
            { new: true, runValidators: true }
        )
            .populate('category', 'name description icon color')
            .populate('status', 'name description color icon')
            .populate('userId', 'name email role');

        res.status(200).json({
            success: true,
            message: 'Complaint updated successfully',
            data: updatedComplaint
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete complaint
// @route   DELETE /api/complaints/:id
// @access  Private
const deleteComplaint = async (req, res, next) => {
    try {
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }

        // Check if user owns the complaint
        if (complaint.userId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this complaint'
            });
        }

        // Check if complaint can be deleted (only if status is Submitted)
        const status = await Status.findById(complaint.status);
        if (status.name !== 'Submitted') {
            return res.status(400).json({
                success: false,
                message: 'Complaint cannot be deleted in current status'
            });
        }

        // Delete complaint
        await Complaint.findByIdAndDelete(req.params.id);

        // Update user statistics
        await User.findByIdAndUpdate(req.user.id, {
            $inc: { complaintsSubmitted: -1 }
        });

        // Update category complaint count
        await Category.findByIdAndUpdate(complaint.category, {
            $inc: { complaintCount: -1 }
        });

        res.status(200).json({
            success: true,
            message: 'Complaint deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Vote on complaint (upvote/downvote)
// @route   POST /api/complaints/:id/vote
// @access  Private
const voteComplaint = async (req, res, next) => {
    try {
        const { vote } = req.body; // 'up' or 'down'
        const complaintId = req.params.id;

        if (!vote || !['up', 'down'].includes(vote)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide valid vote (up or down)'
            });
        }

        const complaint = await Complaint.findById(complaintId);
        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }

        // Update vote count
        const updateField = vote === 'up' ? 'upvotes' : 'downvotes';
        const updatedComplaint = await Complaint.findByIdAndUpdate(
            complaintId,
            { $inc: { [updateField]: 1 } },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: `Vote ${vote} recorded successfully`,
            data: {
                upvotes: updatedComplaint.upvotes,
                downvotes: updatedComplaint.downvotes
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get complaint statistics for user
// @route   GET /api/complaints/stats
// @access  Private
const getComplaintStats = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Get complaint counts by status
        const statusCounts = await Complaint.aggregate([
            { $match: { userId: userId } },
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
            }
        ]);

        // Get total complaints
        const totalComplaints = await Complaint.countDocuments({ userId });

        // Get recent complaints (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentComplaints = await Complaint.countDocuments({
            userId,
            createdAt: { $gte: thirtyDaysAgo }
        });

        res.status(200).json({
            success: true,
            data: {
                total: totalComplaints,
                recent: recentComplaints,
                byStatus: statusCounts
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createComplaint,
    getUserComplaints,
    getComplaint,
    updateComplaint,
    deleteComplaint,
    voteComplaint,
    getComplaintStats
};
