// Import required models
const Category = require('../models/Category');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res, next) => {
    try {
        const { isActive } = req.query;

        // Build filter
        const filter = {};
        if (isActive !== undefined) {
            filter.isActive = isActive === 'true';
        }

        const categories = await Category.find(filter)
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

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
const getCategory = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.status(200).json({
            success: true,
            data: category
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new category (admin only)
// @route   POST /api/categories
// @access  Private (Admin only)
const createCategory = async (req, res, next) => {
    try {
        const { name, description, icon, color } = req.body;

        // Check if category already exists
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: 'Category with this name already exists'
            });
        }

        const category = await Category.create({
            name,
            description,
            icon,
            color
        });

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: category
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update category (admin only)
// @route   PUT /api/categories/:id
// @access  Private (Admin only)
const updateCategory = async (req, res, next) => {
    try {
        const { name, description, icon, color, isActive } = req.body;

        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Check if name is being changed and if it already exists
        if (name && name !== category.name) {
            const existingCategory = await Category.findOne({ name });
            if (existingCategory) {
                return res.status(400).json({
                    success: false,
                    message: 'Category with this name already exists'
                });
            }
        }

        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            {
                name: name || category.name,
                description: description || category.description,
                icon: icon || category.icon,
                color: color || category.color,
                isActive: isActive !== undefined ? isActive : category.isActive
            },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Category updated successfully',
            data: updatedCategory
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete category (admin only)
// @route   DELETE /api/categories/:id
// @access  Private (Admin only)
const deleteCategory = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Check if category has complaints
        const Complaint = require('../models/Complaint');
        const complaintCount = await Complaint.countDocuments({ category: req.params.id });

        if (complaintCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete category. It has ${complaintCount} associated complaints.`
            });
        }

        await Category.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get category statistics
// @route   GET /api/categories/stats
// @access  Public
const getCategoryStats = async (req, res, next) => {
    try {
        const categories = await Category.find({ isActive: true })
            .select('name description icon color complaintCount')
            .sort({ complaintCount: -1 });

        const totalComplaints = categories.reduce((sum, cat) => sum + cat.complaintCount, 0);

        res.status(200).json({
            success: true,
            data: {
                categories,
                totalComplaints,
                categoryCount: categories.length
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryStats
};
