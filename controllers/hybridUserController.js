// Hybrid User Controller - Demonstrates MongoDB + Firebase usage
const UserHybrid = require('../models/UserHybrid');
const { auth, db } = require('../config/firebase');

// Create user in both databases
const createHybridUser = async (req, res) => {
    try {
        const { name, email, password, age, profilePicture, bio } = req.body;

        // Create user in both MongoDB and Firebase
        const { mongoUser, firebaseUser } = await UserHybrid.createHybridUser({
            name,
            email,
            password,
            age,
            profilePicture,
            bio
        });

        res.status(201).json({
            success: true,
            message: 'User created successfully in both databases',
            data: {
                mongoUser: {
                    id: mongoUser._id,
                    firebaseUid: mongoUser.firebaseUid,
                    name: mongoUser.name,
                    email: mongoUser.email
                },
                firebaseUser: {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName
                }
            }
        });
    } catch (error) {
        console.error('Hybrid user creation error:', error);
        res.status(400).json({
            success: false,
            message: 'Failed to create user',
            error: error.message
        });
    }
};

// Get user with data from both databases
const getHybridUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Get user from MongoDB
        const mongoUser = await UserHybrid.findById(id);
        if (!mongoUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get combined data from both databases
        const userWithFirebaseData = await mongoUser.getWithFirebaseData();

        res.status(200).json({
            success: true,
            data: userWithFirebaseData
        });
    } catch (error) {
        console.error('Get hybrid user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user data',
            error: error.message
        });
    }
};

// Update user status (real-time)
const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isOnline } = req.body;

        const user = await UserHybrid.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update status in both databases
        await user.updateFirebaseStatus(isOnline);

        res.status(200).json({
            success: true,
            message: 'User status updated successfully',
            data: {
                id: user._id,
                isOnline: user.isOnline,
                lastSeen: user.lastSeen
            }
        });
    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user status',
            error: error.message
        });
    }
};

// Get real-time user list from Firebase
const getOnlineUsers = async (req, res) => {
    try {
        // Query Firebase for online users
        const onlineUsersSnapshot = await db.collection('users')
            .where('isOnline', '==', true)
            .orderBy('lastSeen', 'desc')
            .limit(50)
            .get();

        const onlineUsers = [];
        onlineUsersSnapshot.forEach(doc => {
            onlineUsers.push({
                uid: doc.id,
                ...doc.data()
            });
        });

        res.status(200).json({
            success: true,
            data: onlineUsers,
            count: onlineUsers.length
        });
    } catch (error) {
        console.error('Get online users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get online users',
            error: error.message
        });
    }
};

// Complex query using MongoDB
const searchUsers = async (req, res) => {
    try {
        const { name, age, isActive } = req.query;

        // Build MongoDB query
        const query = {};
        if (name) query.name = { $regex: name, $options: 'i' };
        if (age) query.age = { $gte: parseInt(age) };
        if (isActive !== undefined) query.isActive = isActive === 'true';

        // Execute complex MongoDB query
        const users = await UserHybrid.find(query)
            .select('name email age profilePicture lastSeen isOnline')
            .sort({ createdAt: -1 })
            .limit(20);

        res.status(200).json({
            success: true,
            data: users,
            count: users.length
        });
    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search users',
            error: error.message
        });
    }
};

module.exports = {
    createHybridUser,
    getHybridUser,
    updateUserStatus,
    getOnlineUsers,
    searchUsers
};
