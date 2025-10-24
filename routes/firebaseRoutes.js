// Firebase routes for backend
const express = require('express');
const router = express.Router();
const {
    createFirebaseUser,
    getFirebaseUser,
    updateFirebaseUser,
    deleteFirebaseUser,
    generateCustomToken,
    verifyIdToken
} = require('../controllers/firebaseController');
const {
    testFirebaseConnection,
    testFirestoreWrite,
    testFirestoreRead
} = require('../controllers/firebaseTestController');
const {
    runFirebaseDiagnostic,
    testServiceAccountPermissions
} = require('../controllers/firebaseDiagnosticController');
const { verifyFirebaseToken } = require('../middleware/firebaseAuth');

// Create a new Firebase user
router.post('/users', createFirebaseUser);

// Get Firebase user by UID
router.get('/users/:uid', getFirebaseUser);

// Update Firebase user
router.put('/users/:uid', updateFirebaseUser);

// Delete Firebase user
router.delete('/users/:uid', deleteFirebaseUser);

// Generate custom token for user
router.post('/custom-token', generateCustomToken);

// Verify ID token
router.post('/verify-token', verifyIdToken);

// Protected route example (requires Firebase authentication)
router.get('/protected', verifyFirebaseToken, (req, res) => {
    res.json({
        success: true,
        message: 'This is a protected route',
        user: req.user
    });
});

// Test routes
router.get('/test/connection', testFirebaseConnection);
router.post('/test/firestore/write', testFirestoreWrite);
router.get('/test/firestore/read', testFirestoreRead);

// Diagnostic routes
router.get('/diagnostic', runFirebaseDiagnostic);
router.get('/diagnostic/permissions', testServiceAccountPermissions);

module.exports = router;
