// Firebase Controller for backend operations
const { auth, db, storage } = require('../config/firebase');

// Create a new user in Firebase Auth
const createFirebaseUser = async (req, res) => {
    try {
        const { email, password, displayName } = req.body;

        // Create user in Firebase Auth
        const userRecord = await auth.createUser({
            email: email,
            password: password,
            displayName: displayName,
            emailVerified: false
        });

        res.status(201).json({
            success: true,
            message: 'Firebase user created successfully',
            data: {
                uid: userRecord.uid,
                email: userRecord.email,
                displayName: userRecord.displayName
            }
        });
    } catch (error) {
        console.error('Firebase user creation error:', error);
        res.status(400).json({
            success: false,
            message: 'Failed to create Firebase user',
            error: error.message
        });
    }
};

// Get user by UID
const getFirebaseUser = async (req, res) => {
    try {
        const { uid } = req.params;

        const userRecord = await auth.getUser(uid);

        res.status(200).json({
            success: true,
            data: {
                uid: userRecord.uid,
                email: userRecord.email,
                displayName: userRecord.displayName,
                emailVerified: userRecord.emailVerified,
                disabled: userRecord.disabled,
                metadata: userRecord.metadata
            }
        });
    } catch (error) {
        console.error('Firebase user retrieval error:', error);
        res.status(404).json({
            success: false,
            message: 'User not found',
            error: error.message
        });
    }
};

// Update Firebase user
const updateFirebaseUser = async (req, res) => {
    try {
        const { uid } = req.params;
        const { displayName, email, emailVerified, disabled } = req.body;

        const updateData = {};
        if (displayName !== undefined) updateData.displayName = displayName;
        if (email !== undefined) updateData.email = email;
        if (emailVerified !== undefined) updateData.emailVerified = emailVerified;
        if (disabled !== undefined) updateData.disabled = disabled;

        const userRecord = await auth.updateUser(uid, updateData);

        res.status(200).json({
            success: true,
            message: 'Firebase user updated successfully',
            data: {
                uid: userRecord.uid,
                email: userRecord.email,
                displayName: userRecord.displayName,
                emailVerified: userRecord.emailVerified,
                disabled: userRecord.disabled
            }
        });
    } catch (error) {
        console.error('Firebase user update error:', error);
        res.status(400).json({
            success: false,
            message: 'Failed to update Firebase user',
            error: error.message
        });
    }
};

// Delete Firebase user
const deleteFirebaseUser = async (req, res) => {
    try {
        const { uid } = req.params;

        await auth.deleteUser(uid);

        res.status(200).json({
            success: true,
            message: 'Firebase user deleted successfully'
        });
    } catch (error) {
        console.error('Firebase user deletion error:', error);
        res.status(400).json({
            success: false,
            message: 'Failed to delete Firebase user',
            error: error.message
        });
    }
};

// Generate custom token for user
const generateCustomToken = async (req, res) => {
    try {
        const { uid, additionalClaims } = req.body;

        const customToken = await auth.createCustomToken(uid, additionalClaims);

        res.status(200).json({
            success: true,
            customToken: customToken
        });
    } catch (error) {
        console.error('Custom token generation error:', error);
        res.status(400).json({
            success: false,
            message: 'Failed to generate custom token',
            error: error.message
        });
    }
};

// Verify ID token
const verifyIdToken = async (req, res) => {
    try {
        const { idToken } = req.body;

        const decodedToken = await auth.verifyIdToken(idToken);

        res.status(200).json({
            success: true,
            data: {
                uid: decodedToken.uid,
                email: decodedToken.email,
                email_verified: decodedToken.email_verified,
                name: decodedToken.name,
                picture: decodedToken.picture,
                iss: decodedToken.iss,
                aud: decodedToken.aud,
                auth_time: decodedToken.auth_time,
                exp: decodedToken.exp,
                iat: decodedToken.iat
            }
        });
    } catch (error) {
        console.error('ID token verification error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid ID token',
            error: error.message
        });
    }
};

module.exports = {
    createFirebaseUser,
    getFirebaseUser,
    updateFirebaseUser,
    deleteFirebaseUser,
    generateCustomToken,
    verifyIdToken
};
