// Debug admin password issue
const mongoose = require('mongoose');
require('dotenv').config();

const Admin = require('./models/Admin');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hackapp');
        console.log('MongoDB connected for debugging');
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

const debugAdmin = async () => {
    try {
        const admin = await Admin.findOne({ email: 'admin@mycity.gov' }).select('+password');
        
        if (admin) {
            console.log('Admin found:');
            console.log('- Name:', admin.name);
            console.log('- Email:', admin.email);
            console.log('- Role:', admin.role);
            console.log('- IsActive:', admin.isActive);
            console.log('- Password exists:', !!admin.password);
            console.log('- Password length:', admin.password ? admin.password.length : 0);
            console.log('- Password starts with $2b$:', admin.password ? admin.password.startsWith('$2b$') : false);
            
            // Try manual bcrypt comparison
            const bcrypt = require('bcryptjs');
            try {
                const isMatch = await bcrypt.compare('admin123', admin.password);
                console.log('✅ Manual bcrypt comparison:', isMatch);
            } catch (bcryptError) {
                console.log('❌ Bcrypt error:', bcryptError.message);
            }
            
        } else {
            console.log('❌ Admin not found');
        }
        
    } catch (error) {
        console.error('❌ Debug error:', error);
    } finally {
        mongoose.connection.close();
    }
};

const runDebug = async () => {
    await connectDB();
    await debugAdmin();
};

runDebug();
