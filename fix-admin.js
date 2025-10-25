// Fix admin password hashing
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Admin = require('./models/Admin');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hackapp');
        console.log('MongoDB connected for fixing admin');
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

const fixAdminPassword = async () => {
    try {
        // Delete existing admin
        await Admin.deleteMany({ email: 'admin@mycity.gov' });
        console.log('✅ Deleted existing admin');
        
        // Create new admin with proper password hashing
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        
        const admin = new Admin({
            name: 'Super Admin',
            email: 'admin@mycity.gov',
            password: hashedPassword,
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
            isActive: true,
            profile: {
                phone: '1234567890',
                department: 'IT Department'
            }
        });
        
        await admin.save();
        console.log('✅ Created new admin with proper password hashing');
        
        // Test the password
        const testAdmin = await Admin.findOne({ email: 'admin@mycity.gov' });
        const isMatch = await testAdmin.matchPassword('admin123');
        console.log('✅ Password test result:', isMatch);
        
    } catch (error) {
        console.error('❌ Fix error:', error);
    } finally {
        mongoose.connection.close();
    }
};

const runFix = async () => {
    await connectDB();
    await fixAdminPassword();
};

runFix();
