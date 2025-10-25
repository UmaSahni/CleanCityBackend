// Import required modules
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Admin = require('../models/Admin');
const NotificationTemplate = require('../models/NotificationTemplate');

// Connect to database
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hackapp');
        console.log('MongoDB connected for admin seeding');
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

// Seed admin data
const seedAdminData = async () => {
    try {
        // Clear existing admin data
        await Admin.deleteMany({});
        await NotificationTemplate.deleteMany({});

        console.log('Cleared existing admin data');

        // Create admin users
        const adminUsers = [
            {
                name: 'Super Admin',
                email: 'admin@mycity.gov',
                password: 'admin123',
                role: 'super_admin',
                permissions: [
                    'manage_complaints',
                    'manage_users',
                    'manage_categories',
                    'manage_notifications',
                    'view_analytics',
                    'manage_settings',
                    'manage_resolved'
                ],
                profile: {
                    phone: '1234567890',
                    department: 'IT Department'
                }
            },
            {
                name: 'John Admin',
                email: 'john@mycity.gov',
                password: 'admin123',
                role: 'admin',
                permissions: [
                    'manage_complaints',
                    'manage_users',
                    'view_analytics'
                ],
                profile: {
                    phone: '1234567891',
                    department: 'Public Works'
                }
            }
        ];

        const createdAdmins = await Admin.insertMany(adminUsers);
        console.log('Created admin users');

        // Create notification templates
        const notificationTemplates = [
            {
                name: 'Status Update - Pending',
                subject: 'Your complaint has been received',
                message: 'Thank you for reporting this issue. We have received your complaint and it is currently under review.',
                type: 'email',
                category: 'status_update',
                variables: ['userName', 'complaintTitle', 'complaintNumber']
            },
            {
                name: 'Status Update - In Progress',
                subject: 'Work has started on your complaint',
                message: 'We have started working on your reported issue. You will receive updates as we progress.',
                type: 'push',
                category: 'status_update',
                variables: ['userName', 'complaintTitle', 'complaintNumber']
            },
            {
                name: 'Status Update - Resolved',
                subject: 'Your complaint has been resolved',
                message: 'The issue you reported has been successfully resolved. Thank you for helping us improve our city.',
                type: 'both',
                category: 'status_update',
                variables: ['userName', 'complaintTitle', 'complaintNumber']
            },
            {
                name: 'Welcome Message',
                subject: 'Welcome to our complaint system',
                message: 'Welcome! You can now report civic issues and track their resolution status.',
                type: 'email',
                category: 'welcome',
                variables: ['userName']
            }
        ];

        await NotificationTemplate.insertMany(notificationTemplates);
        console.log('Created notification templates');

        console.log('Admin data seeded successfully!');
        console.log('Admin credentials:');
        console.log('Email: admin@mycity.gov, Password: admin123');
        console.log('Email: john@mycity.gov, Password: admin123');

    } catch (error) {
        console.error('Admin seeding error:', error);
    } finally {
        mongoose.connection.close();
    }
};

// Run seeding
const runAdminSeed = async () => {
    await connectDB();
    await seedAdminData();
};

runAdminSeed();
