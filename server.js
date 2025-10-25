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
app.use(cors({
    origin: ['http://localhost:3000', 'http://192.168.1.12:3000', 'exp://192.168.1.12:8081'],
    credentials: true
})); // Enable CORS for all routes
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
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`API Base URL: http://localhost:${PORT}/api`);
        console.log(`Network URL: http://192.168.1.12:${PORT}/api`);
        console.log('Server is accessible from your phone!');
    });
};

// Start the server
startServer();
