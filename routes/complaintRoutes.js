// Import Express Router
const express = require('express');
const router = express.Router();

// Import complaint controller functions
const {
    createComplaint,
    getUserComplaints,
    getComplaint,
    updateComplaint,
    deleteComplaint,
    voteComplaint,
    getComplaintStats
} = require('../controllers/complaintController');

// Import authentication middleware
const { protect } = require('../middleware/auth');

// Define complaint routes
router.route('/')
    .get(protect, getUserComplaints)     // GET /api/complaints
    .post(protect, createComplaint);     // POST /api/complaints

router.route('/stats')
    .get(protect, getComplaintStats);    // GET /api/complaints/stats

router.route('/:id')
    .get(protect, getComplaint)          // GET /api/complaints/:id
    .put(protect, updateComplaint)       // PUT /api/complaints/:id
    .delete(protect, deleteComplaint);   // DELETE /api/complaints/:id

router.route('/:id/vote')
    .post(protect, voteComplaint);       // POST /api/complaints/:id/vote

// Export the router
module.exports = router;
