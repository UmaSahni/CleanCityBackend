// Create working admin
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Admin = require('./models/Admin');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hackapp');
        console.log('MongoDB connected for creating admin');
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

const createWorkingAdmin = async () => {
    try {
        // Delete all existing admins
        await Admin.deleteMany({});
        console.log('✅ Deleted all existing admins');
        
        // Create admin with plain password (let the pre-save hook handle hashing)
        const admin = new Admin({
            name: 'Super Admin',
            email: 'admin@mycity.gov',
            password: 'admin123', // Plain password - pre-save hook will hash it
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
        console.log('✅ Created admin with plain password (will be hashed by pre-save hook)');
        
        // Test the password after save
        const testAdmin = await Admin.findOne({ email: 'admin@mycity.gov' }).select('+password');
        console.log('Password after save:', testAdmin.password.substring(0, 10) + '...');
        console.log('Password starts with $2b$:', testAdmin.password.startsWith('$2b$'));
        
        const isMatch = await testAdmin.matchPassword('admin123');
        console.log('✅ Password test result:', isMatch);
        
    } catch (error) {
        console.error('❌ Create error:', error);
    } finally {
        mongoose.connection.close();
    }
};

const runCreate = async () => {
    await connectDB();
    await createWorkingAdmin();
};

runCreate();
