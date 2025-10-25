// Import required modules
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Protect admin routes - verify JWT token
const protect = async (req, res, next) => {
    let token;

    // Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header (remove 'Bearer ' prefix)
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'admin-secret-key');

            // Get admin from token (excluding password)
            req.admin = await Admin.findById(decoded.id).select('-password');

            if (!req.admin) {
                return res.status(401).json({
                    success: false,
                    message: 'Admin not found'
                });
            }

            next();
        } catch (error) {
            console.error('Token verification error:', error);
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }
    }

    // No token provided
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, no token provided'
        });
    }
};

// Grant access to specific admin roles
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }

        // Check if admin role is in allowed roles
        if (!roles.includes(req.admin.role)) {
            return res.status(403).json({
                success: false,
                message: `Admin role ${req.admin.role} is not authorized to access this route`
            });
        }

        next();
    };
};

module.exports = { protect, authorize };
