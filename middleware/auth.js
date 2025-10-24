// Import required modules
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
    let token;

    // Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header (remove 'Bearer ' prefix)
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');

            // Get user from token (excluding password)
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
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

// Grant access to specific roles
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }

        // Check if user role is in allowed roles
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role ${req.user.role} is not authorized to access this route`
            });
        }

        next();
    };
};

module.exports = { protect, authorize };
