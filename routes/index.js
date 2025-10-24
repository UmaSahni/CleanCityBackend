// Import Express Router
const express = require('express');
const router = express.Router();

// Import individual route files
const userRoutes = require('./userRoutes');
const authRoutes = require('./authRoutes');
const uploadRoutes = require('./uploadRoutes');
const firebaseRoutes = require('./firebaseRoutes');

// Define main routes
router.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the Express.js API with MVC structure!',
        status: 'Server is running successfully',
        endpoints: {
            auth: '/api/auth',
            users: '/api/users',
            upload: '/api/upload',
            firebase: '/api/firebase',
            health: '/api/health'
        }
    });
});

// Health check route
router.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/upload', uploadRoutes);
router.use('/firebase', firebaseRoutes);

// Export the router
module.exports = router;
