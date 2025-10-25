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

// Import new admin controllers
const {
    login: adminLogin,
    getMe: adminGetMe,
    updateProfile: adminUpdateProfile,
    changePassword: adminChangePassword,
    logout: adminLogout
} = require('../controllers/adminAuthController');

const {
    getAdminDashboard: getDashboardStats,
    getDashboardCharts,
    getRecentActivity
} = require('../controllers/simpleDashboardController');

const {
    getAllUsers: adminGetAllUsers,
    getUser: adminGetUser,
    updateUserStatus: adminUpdateUserStatus,
    getUserStats: adminGetUserStats,
    getUserComplaints: adminGetUserComplaints
} = require('../controllers/adminUserController');

const {
    getNotificationTemplates,
    createNotificationTemplate,
    updateNotificationTemplate,
    deleteNotificationTemplate,
    getNotificationHistory,
    sendNotification,
    getNotificationStats
} = require('../controllers/adminNotificationController');

// Import authentication middleware
const { protect, authorize } = require('../middleware/adminAuth');

// Admin Authentication Routes
router.route('/auth/login')
    .post(adminLogin); // POST /api/admin/auth/login

router.route('/auth/me')
    .get(protect, authorize('admin', 'super_admin'), adminGetMe); // GET /api/admin/auth/me

router.route('/auth/profile')
    .put(protect, authorize('admin', 'super_admin'), adminUpdateProfile); // PUT /api/admin/auth/profile

router.route('/auth/change-password')
    .put(protect, authorize('admin', 'super_admin'), adminChangePassword); // PUT /api/admin/auth/change-password

router.route('/auth/logout')
    .post(protect, authorize('admin', 'super_admin'), adminLogout); // POST /api/admin/auth/logout

// Dashboard Routes
router.route('/dashboard')
    .get(protect, authorize('admin', 'super_admin'), getDashboardStats); // GET /api/admin/dashboard

router.route('/dashboard/charts')
    .get(protect, authorize('admin', 'super_admin'), getDashboardCharts); // GET /api/admin/dashboard/charts

router.route('/dashboard/activity')
    .get(protect, authorize('admin', 'super_admin'), getRecentActivity); // GET /api/admin/dashboard/activity

// Complaint Routes
router.route('/complaints')
    .get(protect, authorize('admin', 'super_admin'), getAllComplaints); // GET /api/admin/complaints

router.route('/complaints/:id')
    .get(protect, authorize('admin', 'super_admin'), getComplaintForAdmin); // GET /api/admin/complaints/:id

router.route('/complaints/:id/status')
    .put(protect, authorize('admin', 'super_admin'), updateComplaintStatus); // PUT /api/admin/complaints/:id/status

router.route('/complaints/:id/assign')
    .put(protect, authorize('admin', 'super_admin'), assignComplaint); // PUT /api/admin/complaints/:id/assign

// User Management Routes
router.route('/users')
    .get(protect, authorize('admin', 'super_admin'), adminGetAllUsers); // GET /api/admin/users

router.route('/users/stats')
    .get(protect, authorize('admin', 'super_admin'), adminGetUserStats); // GET /api/admin/users/stats

router.route('/users/:id')
    .get(protect, authorize('admin', 'super_admin'), adminGetUser); // GET /api/admin/users/:id

router.route('/users/:id/status')
    .put(protect, authorize('admin', 'super_admin'), adminUpdateUserStatus); // PUT /api/admin/users/:id/status

router.route('/users/:id/complaints')
    .get(protect, authorize('admin', 'super_admin'), adminGetUserComplaints); // GET /api/admin/users/:id/complaints

// Notification Routes
router.route('/notifications/templates')
    .get(protect, authorize('admin', 'super_admin'), getNotificationTemplates) // GET /api/admin/notifications/templates
    .post(protect, authorize('admin', 'super_admin'), createNotificationTemplate); // POST /api/admin/notifications/templates

router.route('/notifications/templates/:id')
    .put(protect, authorize('admin', 'super_admin'), updateNotificationTemplate) // PUT /api/admin/notifications/templates/:id
    .delete(protect, authorize('admin', 'super_admin'), deleteNotificationTemplate); // DELETE /api/admin/notifications/templates/:id

router.route('/notifications/history')
    .get(protect, authorize('admin', 'super_admin'), getNotificationHistory); // GET /api/admin/notifications/history

router.route('/notifications/send')
    .post(protect, authorize('admin', 'super_admin'), sendNotification); // POST /api/admin/notifications/send

router.route('/notifications/stats')
    .get(protect, authorize('admin', 'super_admin'), getNotificationStats); // GET /api/admin/notifications/stats

// Export the router
module.exports = router;
