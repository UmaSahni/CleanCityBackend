// Import mongoose for MongoDB connection
const mongoose = require('mongoose');

// Database connection function
const connectDB = async () => {
    try {
        // Connect to MongoDB using connection string from environment variables
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hackapp');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1); // Exit process with failure
    }
};

// Export the connection function
module.exports = connectDB;
