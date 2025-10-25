const express = require('express');
const router = express.Router();
const Status = require('../models/Status');

// @desc    Get all statuses
// @route   GET /api/statuses
// @access  Public
const getAllStatuses = async (req, res, next) => {
    try {
        const statuses = await Status.find().sort({ order: 1 });
        
        res.status(200).json({
            success: true,
            count: statuses.length,
            data: statuses
        });
    } catch (error) {
        console.error('Get statuses error:', error);
        next(error);
    }
};

// @desc    Get single status
// @route   GET /api/statuses/:id
// @access  Public
const getStatus = async (req, res, next) => {
    try {
        const status = await Status.findById(req.params.id);
        
        if (!status) {
            return res.status(404).json({
                success: false,
                message: 'Status not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: status
        });
    } catch (error) {
        console.error('Get status error:', error);
        next(error);
    }
};

// @desc    Create new status
// @route   POST /api/statuses
// @access  Private (Admin only)
const createStatus = async (req, res, next) => {
    try {
        const status = await Status.create(req.body);
        
        res.status(201).json({
            success: true,
            data: status
        });
    } catch (error) {
        console.error('Create status error:', error);
        next(error);
    }
};

// @desc    Update status
// @route   PUT /api/statuses/:id
// @access  Private (Admin only)
const updateStatus = async (req, res, next) => {
    try {
        const status = await Status.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!status) {
            return res.status(404).json({
                success: false,
                message: 'Status not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: status
        });
    } catch (error) {
        console.error('Update status error:', error);
        next(error);
    }
};

// @desc    Delete status
// @route   DELETE /api/statuses/:id
// @access  Private (Admin only)
const deleteStatus = async (req, res, next) => {
    try {
        const status = await Status.findByIdAndDelete(req.params.id);
        
        if (!status) {
            return res.status(404).json({
                success: false,
                message: 'Status not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Status deleted successfully'
        });
    } catch (error) {
        console.error('Delete status error:', error);
        next(error);
    }
};

// Define routes
router.get('/', getAllStatuses);
router.get('/:id', getStatus);
router.post('/', createStatus);
router.put('/:id', updateStatus);
router.delete('/:id', deleteStatus);

module.exports = router;
