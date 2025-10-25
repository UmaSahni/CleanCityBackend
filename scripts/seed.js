// Import required modules
const mongoose = require('mongoose');
require('dotenv').config();

// Import database connection and seed data
const connectDB = require('../config/database');
const { seedAll } = require('../config/seedData');

// Function to run seeding
const runSeed = async () => {
    try {
        // Connect to database
        await connectDB();

        // Run seeding
        await seedAll();

        console.log('🎉 Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('💥 Seeding failed:', error);
        process.exit(1);
    }
};

// Run the seeding
runSeed();
