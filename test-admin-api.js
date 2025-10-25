// Simple Admin API test script
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test data
const adminCredentials = {
    email: 'admin@mycity.gov',
    password: 'admin123'
};

let authToken = '';

// Test functions
async function testHealthCheck() {
    try {
        console.log('Testing health check...');
        const response = await axios.get(`${BASE_URL}/health`);
        console.log('✅ Health check passed:', response.data);
        return true;
    } catch (error) {
        console.log('❌ Health check failed:', error.message);
        return false;
    }
}

async function testAdminLogin() {
    try {
        console.log('Testing admin login...');
        const response = await axios.post(`${BASE_URL}/admin/auth/login`, adminCredentials);
        authToken = response.data.token;
        console.log('✅ Admin login successful:', response.data.admin.name);
        return true;
    } catch (error) {
        console.log('❌ Admin login failed:', error.response?.data?.message || error.message);
        return false;
    }
}

async function testAdminDashboard() {
    try {
        console.log('Testing admin dashboard...');
        const response = await axios.get(`${BASE_URL}/admin/dashboard`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('✅ Admin dashboard retrieved:', response.data.data.overview);
        return true;
    } catch (error) {
        console.log('❌ Admin dashboard failed:', error.response?.data?.message || error.message);
        return false;
    }
}

async function testAdminComplaints() {
    try {
        console.log('Testing admin complaints...');
        const response = await axios.get(`${BASE_URL}/admin/complaints`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('✅ Admin complaints retrieved:', response.data.count, 'complaints');
        return true;
    } catch (error) {
        console.log('❌ Admin complaints failed:', error.response?.data?.message || error.message);
        return false;
    }
}

async function testAdminUsers() {
    try {
        console.log('Testing admin users...');
        const response = await axios.get(`${BASE_URL}/admin/users`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('✅ Admin users retrieved:', response.data.count, 'users');
        return true;
    } catch (error) {
        console.log('❌ Admin users failed:', error.response?.data?.message || error.message);
        return false;
    }
}

async function testAdminNotifications() {
    try {
        console.log('Testing admin notifications...');
        const response = await axios.get(`${BASE_URL}/admin/notifications/templates`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('✅ Admin notifications retrieved:', response.data.count, 'templates');
        return true;
    } catch (error) {
        console.log('❌ Admin notifications failed:', error.response?.data?.message || error.message);
        return false;
    }
}

// Run all tests
async function runTests() {
    console.log('🚀 Starting Admin API tests...\n');
    
    const tests = [
        testHealthCheck,
        testAdminLogin,
        testAdminDashboard,
        testAdminComplaints,
        testAdminUsers,
        testAdminNotifications
    ];
    
    let passed = 0;
    let total = tests.length;
    
    for (const test of tests) {
        const result = await test();
        if (result) passed++;
        console.log(''); // Add spacing
    }
    
    console.log('📊 Test Results:');
    console.log(`✅ Passed: ${passed}/${total}`);
    console.log(`❌ Failed: ${total - passed}/${total}`);
    
    if (passed === total) {
        console.log('🎉 All admin tests passed! Integration is working correctly.');
    } else {
        console.log('⚠️  Some tests failed. Please check:');
        console.log('   1. Server is running on port 5000');
        console.log('   2. Admin data is seeded (npm run admin-seed)');
        console.log('   3. Database is connected');
    }
}

// Check if axios is available
if (typeof require !== 'undefined') {
    try {
        require('axios');
        runTests();
    } catch (error) {
        console.log('❌ axios is not installed. Please run: npm install axios');
        console.log('Then run: node test-admin-api.js');
    }
} else {
    console.log('This script should be run with Node.js');
}
