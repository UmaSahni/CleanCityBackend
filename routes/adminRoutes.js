// Import Express Router
const express = require('express');
const router = express.Router();

// Import admin controller functions
const {
    getAllComplaints,
    updateComplaintStatus,
    assignComplaint,
    getAdminDashboard,
    getComplaintForAdmin
} = require('../controllers/adminController');

// Import authentication middleware
const { protect, authorize } = require('../middleware/auth');

// Define admin routes (all protected and admin-only)
router.route('/complaints')
    .get(protect, authorize('admin', 'super_admin'), getAllComplaints); // GET /api/admin/complaints

router.route('/dashboard')
    .get(protect, authorize('admin', 'super_admin'), getAdminDashboard); // GET /api/admin/dashboard

router.route('/complaints/:id')
    .get(protect, authorize('admin', 'super_admin'), getComplaintForAdmin); // GET /api/admin/complaints/:id

router.route('/complaints/:id/status')
    .put(protect, authorize('admin', 'super_admin'), updateComplaintStatus); // PUT /api/admin/complaints/:id/status

router.route('/complaints/:id/assign')
    .put(protect, authorize('admin', 'super_admin'), assignComplaint); // PUT /api/admin/complaints/:id/assign

// Export the router
module.exports = router;
