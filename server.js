// Import required modules
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import custom modules
const connectDB = require('./config/database');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

// Create Express app
const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Routes
app.use('/api', routes);

// Error handling middleware (must be after routes)
app.use(notFound); // Handle 404 routes
app.use(errorHandler); // Handle all errors

// Server configuration
const PORT = process.env.PORT || 5002;

// Start server only after MongoDB connection is established
const startServer = async () => {
    await connectDB(); // Connect to MongoDB first
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`API Base URL: http://localhost:${PORT}/api`);
    });
};

// Start the server
startServer();
