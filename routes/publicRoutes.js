// Import Express Router
const express = require('express');
const router = express.Router();

// Import public controller functions
const {
    getPublicComplaints,
    getPublicStats,
    getPublicCategories,
    getPublicComplaint,
    searchPublicComplaints
} = require('../controllers/publicController');

// Define public routes (no authentication required)
router.route('/complaints')
    .get(getPublicComplaints);          // GET /api/public/complaints

router.route('/complaints/search')
    .get(searchPublicComplaints);       // GET /api/public/search

router.route('/complaints/:id')
    .get(getPublicComplaint);           // GET /api/public/complaints/:id

router.route('/stats')
    .get(getPublicStats);               // GET /api/public/stats

router.route('/categories')
    .get(getPublicCategories);          // GET /api/public/categories

// Export the router
module.exports = router;
