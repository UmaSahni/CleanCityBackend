// Simple script to test admin data
const mongoose = require('mongoose');
require('dotenv').config();

const Admin = require('./models/Admin');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hackapp');
        console.log('MongoDB connected for testing');
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

const testAdminData = async () => {
    try {
        // Check if admin exists
        const admin = await Admin.findOne({ email: 'admin@mycity.gov' });
        
        if (admin) {
            console.log('✅ Admin found:', {
                name: admin.name,
                email: admin.email,
                role: admin.role,
                isActive: admin.isActive
            });
            
            // Test password match
            const isMatch = await admin.matchPassword('admin123');
            console.log('✅ Password match test:', isMatch);
            
        } else {
            console.log('❌ Admin not found');
        }
        
        // List all admins
        const allAdmins = await Admin.find({});
        console.log('📊 Total admins in database:', allAdmins.length);
        allAdmins.forEach(admin => {
            console.log(`- ${admin.name} (${admin.email}) - ${admin.role}`);
        });
        
    } catch (error) {
        console.error('❌ Test error:', error);
    } finally {
        mongoose.connection.close();
    }
};

const runTest = async () => {
    await connectDB();
    await testAdminData();
};

runTest();
