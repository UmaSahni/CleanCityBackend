// Import required modules
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'admin-secret-key', {
        expiresIn: process.env.JWT_EXPIRE || '30d'
    });
};

// @desc    Login admin
// @route   POST /api/admin/auth/login
// @access  Public
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an email and password'
            });
        }

        // Check for admin
        const admin = await Admin.findOne({ email }).select('+password');

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if admin is active
        if (!admin.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Admin account is inactive'
            });
        }

        // Check password
        const isMatch = await admin.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Update last login
        await admin.updateLastLogin();

        // Create token
        const token = generateToken(admin._id);

        res.status(200).json({
            success: true,
            token,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                permissions: admin.permissions,
                profile: admin.profile,
                lastLogin: admin.lastLogin
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get current logged in admin
// @route   GET /api/admin/auth/me
// @access  Private
const getMe = async (req, res, next) => {
    try {
        const admin = await Admin.findById(req.admin.id);

        res.status(200).json({
            success: true,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                permissions: admin.permissions,
                profile: admin.profile,
                lastLogin: admin.lastLogin,
                complaintsAssigned: admin.complaintsAssigned,
                complaintsResolved: admin.complaintsResolved,
                notificationsSent: admin.notificationsSent
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update admin profile
// @route   PUT /api/admin/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
    try {
        const { name, phone, department, avatar } = req.body;

        const admin = await Admin.findById(req.admin.id);

        if (name) admin.name = name;
        if (phone) admin.profile.phone = phone;
        if (department) admin.profile.department = department;
        if (avatar) admin.profile.avatar = avatar;

        await admin.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                permissions: admin.permissions,
                profile: admin.profile,
                lastLogin: admin.lastLogin
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Change password
// @route   PUT /api/admin/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide current and new password'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters'
            });
        }

        const admin = await Admin.findById(req.admin.id).select('+password');

        // Check current password
        const isMatch = await admin.matchPassword(currentPassword);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        admin.password = newPassword;
        await admin.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Logout admin
// @route   POST /api/admin/auth/logout
// @access  Private
const logout = async (req, res, next) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    login,
    getMe,
    updateProfile,
    changePassword,
    logout
};
