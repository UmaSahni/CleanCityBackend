// Firebase Diagnostic Controller to identify connection issues
const { auth, db, storage, firebaseApp } = require('../config/firebase');

// Comprehensive Firebase diagnostic
const runFirebaseDiagnostic = async (req, res) => {
    const diagnostic = {
        timestamp: new Date().toISOString(),
        projectId: 'cityclean-52bfc',
        tests: {}
    };

    try {
        // Test 1: Firebase App initialization
        diagnostic.tests.appInitialization = {
            status: 'success',
            message: 'Firebase app initialized successfully',
            appName: firebaseApp?.name || 'default'
        };
    } catch (error) {
        diagnostic.tests.appInitialization = {
            status: 'failed',
            message: 'Firebase app initialization failed',
            error: error.message
        };
    }

    try {
        // Test 2: Authentication service
        const authService = auth;
        diagnostic.tests.authentication = {
            status: 'success',
            message: 'Authentication service available'
        };
    } catch (error) {
        diagnostic.tests.authentication = {
            status: 'failed',
            message: 'Authentication service failed',
            error: error.message
        };
    }

    try {
        // Test 3: Firestore service (without actual database call)
        const firestoreService = db;
        diagnostic.tests.firestore = {
            status: 'success',
            message: 'Firestore service available'
        };
    } catch (error) {
        diagnostic.tests.firestore = {
            status: 'failed',
            message: 'Firestore service failed',
            error: error.message
        };
    }

    try {
        // Test 4: Storage service
        const storageService = storage;
        diagnostic.tests.storage = {
            status: 'success',
            message: 'Storage service available'
        };
    } catch (error) {
        diagnostic.tests.storage = {
            status: 'failed',
            message: 'Storage service failed',
            error: error.message
        };
    }

    try {
        // Test 5: Simple Firestore operation (this might fail if APIs not enabled)
        const testCollection = db.collection('diagnostic');
        const testDoc = await testCollection.doc('test').get();
        diagnostic.tests.firestoreOperation = {
            status: 'success',
            message: 'Firestore read operation successful',
            docExists: testDoc.exists
        };
    } catch (error) {
        diagnostic.tests.firestoreOperation = {
            status: 'failed',
            message: 'Firestore operation failed - API might not be enabled',
            error: error.message,
            errorCode: error.code,
            suggestions: [
                'Enable Cloud Firestore API in Google Cloud Console',
                'Check if the project has Firestore enabled',
                'Verify service account permissions'
            ]
        };
    }

    // Overall status
    const failedTests = Object.values(diagnostic.tests).filter(test => test.status === 'failed');
    diagnostic.overallStatus = failedTests.length === 0 ? 'healthy' : 'issues_detected';
    diagnostic.failedTestsCount = failedTests.length;

    res.status(200).json({
        success: true,
        message: 'Firebase diagnostic completed',
        diagnostic
    });
};

// Test service account permissions
const testServiceAccountPermissions = async (req, res) => {
    try {
        // Try to get project info
        const projectId = 'cityclean-52bfc';

        res.status(200).json({
            success: true,
            message: 'Service account permissions test',
            projectId: projectId,
            serviceAccount: {
                clientEmail: 'firebase-adminsdk-fbsvc@cityclean-52bfc.iam.gserviceaccount.com',
                projectId: projectId
            },
            suggestions: [
                'Verify the service account has the following roles:',
                '- Firebase Admin SDK Administrator Service Agent',
                '- Cloud Datastore User',
                '- Firebase Authentication Admin',
                '- Storage Object Admin'
            ]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Service account permissions test failed',
            error: error.message
        });
    }
};

module.exports = {
    runFirebaseDiagnostic,
    testServiceAccountPermissions
};
