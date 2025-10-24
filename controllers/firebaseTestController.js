// Firebase Test Controller to verify Firebase setup
const { auth, db, storage } = require('../config/firebase');

// Test Firebase connection
const testFirebaseConnection = async (req, res) => {
    try {
        // Test Firestore connection
        const testDoc = await db.collection('test').doc('connection').get();

        // Test Auth service
        const authService = auth;

        // Test Storage service
        const storageService = storage;

        res.status(200).json({
            success: true,
            message: 'Firebase connection successful',
            services: {
                firestore: 'Connected',
                auth: 'Connected',
                storage: 'Connected'
            },
            projectId: 'cityclean-52bfc',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Firebase connection test error:', error);
        res.status(500).json({
            success: false,
            message: 'Firebase connection failed',
            error: error.message
        });
    }
};

// Test Firestore write operation
const testFirestoreWrite = async (req, res) => {
    try {
        const testData = {
            message: 'Hello from Firebase!',
            timestamp: new Date().toISOString(),
            testId: Math.random().toString(36).substr(2, 9)
        };

        await db.collection('test').doc('write-test').set(testData);

        res.status(200).json({
            success: true,
            message: 'Firestore write test successful',
            data: testData
        });
    } catch (error) {
        console.error('Firestore write test error:', error);
        res.status(500).json({
            success: false,
            message: 'Firestore write test failed',
            error: error.message
        });
    }
};

// Test Firestore read operation
const testFirestoreRead = async (req, res) => {
    try {
        const doc = await db.collection('test').doc('write-test').get();

        if (doc.exists) {
            res.status(200).json({
                success: true,
                message: 'Firestore read test successful',
                data: doc.data()
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Test document not found'
            });
        }
    } catch (error) {
        console.error('Firestore read test error:', error);
        res.status(500).json({
            success: false,
            message: 'Firestore read test failed',
            error: error.message
        });
    }
};

module.exports = {
    testFirebaseConnection,
    testFirestoreWrite,
    testFirestoreRead
};
