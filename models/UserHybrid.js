// Hybrid User Model - MongoDB + Firebase integration
const mongoose = require('mongoose');
const { auth, db } = require('../config/firebase');

// MongoDB User Schema (detailed profile data)
const userSchema = new mongoose.Schema({
    // Firebase UID for linking
    firebaseUid: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        lowercase: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    // Additional profile data
    age: {
        type: Number,
        min: [1, 'Age must be at least 1'],
        max: [120, 'Age cannot be more than 120']
    },
    profilePicture: String,
    bio: String,
    preferences: {
        notifications: { type: Boolean, default: true },
        theme: { type: String, default: 'light' }
    },
    // Real-time status (synced with Firebase)
    lastSeen: Date,
    isOnline: { type: Boolean, default: false },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Static method to create user in both databases
userSchema.statics.createHybridUser = async function (userData) {
    try {
        // 1. Create Firebase user
        const firebaseUser = await auth.createUser({
            email: userData.email,
            password: userData.password,
            displayName: userData.name
        });

        // 2. Create MongoDB user with Firebase UID
        const mongoUser = await this.create({
            firebaseUid: firebaseUser.uid,
            name: userData.name,
            email: userData.email,
            age: userData.age,
            profilePicture: userData.profilePicture,
            bio: userData.bio,
            preferences: userData.preferences
        });

        // 3. Create Firebase Firestore document for real-time features
        await db.collection('users').doc(firebaseUser.uid).set({
            uid: firebaseUser.uid,
            email: userData.email,
            displayName: userData.name,
            lastSeen: new Date(),
            isOnline: false,
            profilePicture: userData.profilePicture
        });

        return { mongoUser, firebaseUser };
    } catch (error) {
        // Cleanup if any step fails
        if (error.code === 'auth/email-already-exists') {
            throw new Error('User already exists');
        }
        throw error;
    }
};

// Method to update user status in Firebase
userSchema.methods.updateFirebaseStatus = async function (isOnline = true) {
    try {
        await db.collection('users').doc(this.firebaseUid).update({
            lastSeen: new Date(),
            isOnline: isOnline
        });

        // Update MongoDB as well
        this.lastSeen = new Date();
        this.isOnline = isOnline;
        await this.save();
    } catch (error) {
        console.error('Failed to update Firebase status:', error);
        throw error;
    }
};

// Method to get user with Firebase data
userSchema.methods.getWithFirebaseData = async function () {
    try {
        const firebaseDoc = await db.collection('users').doc(this.firebaseUid).get();
        const firebaseData = firebaseDoc.exists ? firebaseDoc.data() : {};

        return {
            ...this.toObject(),
            firebaseData
        };
    } catch (error) {
        console.error('Failed to get Firebase data:', error);
        return this.toObject();
    }
};

module.exports = mongoose.model('UserHybrid', userSchema);
