// Import Express Router
const express = require('express');
const router = express.Router();

// Import authentication controller functions
const {
    register,
    login,
    getMe,
    updateDetails,
    updatePassword
} = require('../controllers/authController');

// Import authentication middleware
const { protect } = require('../middleware/auth');

// Define authentication routes
router.route('/register')
    .post(register); // POST /api/auth/register

router.route('/login')
    .post(login); // POST /api/auth/login

router.route('/me')
    .get(protect, getMe); // GET /api/auth/me

router.route('/updatedetails')
    .put(protect, updateDetails); // PUT /api/auth/updatedetails

router.route('/updatepassword')
    .put(protect, updatePassword); // PUT /api/auth/updatepassword

// Export the router
module.exports = router;
