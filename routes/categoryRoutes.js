// Import Express Router
const express = require('express');
const router = express.Router();

// Import category controller functions
const {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryStats
} = require('../controllers/categoryController');

// Import authentication middleware
const { protect, authorize } = require('../middleware/auth');

// Define category routes
router.route('/')
    .get(getCategories)                 // GET /api/categories
    .post(protect, authorize('admin', 'super_admin'), createCategory); // POST /api/categories

router.route('/stats')
    .get(getCategoryStats);             // GET /api/categories/stats

router.route('/:id')
    .get(getCategory)                    // GET /api/categories/:id
    .put(protect, authorize('admin', 'super_admin'), updateCategory) // PUT /api/categories/:id
    .delete(protect, authorize('admin', 'super_admin'), deleteCategory); // DELETE /api/categories/:id

// Export the router
module.exports = router;
