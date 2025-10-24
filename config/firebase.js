// Firebase Admin SDK configuration for backend
const admin = require('firebase-admin');
const path = require('path');

// Load service account key from JSON file
const serviceAccount = require('../cityclean-52bfc-firebase-adminsdk-fbsvc-d183c01236.json');

// Initialize Firebase Admin with error handling
let firebaseApp;
try {
    if (!admin.apps.length) {
        firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: "https://cityclean-52bfc-default-rtdb.asia-southeast1.firebasedatabase.app",
            storageBucket: "cityclean-52bfc.firebasestorage.app"
        });
        console.log('Firebase Admin initialized successfully');
    } else {
        firebaseApp = admin.app();
        console.log('Using existing Firebase app');
    }
} catch (error) {
    console.error('Firebase initialization error:', error);
    throw error;
}

// Export Firebase Admin instance with error handling
let db, auth, storage;

try {
    db = admin.firestore();
    auth = admin.auth();
    storage = admin.storage();
    console.log('Firebase services initialized successfully');
} catch (error) {
    console.error('Firebase services initialization error:', error);
    throw error;
}

module.exports = {
    admin,
    db,
    auth,
    storage,
    firebaseApp
};
