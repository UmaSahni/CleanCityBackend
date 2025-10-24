// Import Express Router
const express = require('express');
const router = express.Router();

// Import user controller functions
const {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
} = require('../controllers/userController');

// Define routes
router.route('/')
    .get(getUsers)     // GET /api/users
    .post(createUser); // POST /api/users

router.route('/:id')
    .get(getUser)      // GET /api/users/:id
    .put(updateUser)   // PUT /api/users/:id
    .delete(deleteUser); // DELETE /api/users/:id

// Export the router
module.exports = router;
