// Firebase Admin SDK configuration for backend
const admin = require('firebase-admin');

// Initialize Firebase Admin with error handling
let firebaseApp;
try {
    if (!admin.apps.length) {
        let serviceAccount;
        
        // Always try environment variables first (works for both dev and production)
        if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
            console.log('Using Firebase credentials from environment variables');
        } else {
            // Fallback to local file only if environment variable is not set
            // This will only work in development
            try {
                const fs = require('fs');
                const path = require('path');
                const serviceAccountPath = path.join(__dirname, '../cityclean-52bfc-firebase-adminsdk-fbsvc-d183c01236.json');
                
                if (fs.existsSync(serviceAccountPath)) {
                    serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
                    console.log('Using Firebase credentials from local JSON file');
                } else {
                    throw new Error('Local Firebase credentials file not found');
                }
            } catch (localError) {
                console.error('Local Firebase credentials not found:', localError.message);
                throw new Error('No Firebase credentials found. Please set GOOGLE_APPLICATION_CREDENTIALS environment variable or ensure the JSON file exists.');
            }
        }

        firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: process.env.FIREBASE_DATABASE_URL || "https://cityclean-52bfc-default-rtdb.asia-southeast1.firebasedatabase.app",
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "cityclean-52bfc.firebasestorage.app"
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
