# Admin Panel Integration Guide

This guide explains how to integrate the admin panel functionality with your existing CleanCityBackend server.

## 🚀 Quick Start

The admin functionality has been integrated into your existing CleanCityBackend server. No need to create a separate server!

### 1. **Navigate to CleanCityBackend**
```bash
cd Backend-Admin/CleanCityBackend
```

### 2. **Install Dependencies** (if not already done)
```bash
npm install
```

### 3. **Seed Admin Data**
```bash
npm run admin-seed
```

### 4. **Start the Server**
```bash
npm run dev
```

The server will run on `http://localhost:5000` (or your configured PORT)

## 🔑 Admin Credentials

After running the admin seed script:
- **Super Admin**: admin@mycity.gov / admin123
- **Admin**: john@mycity.gov / admin123

## 📡 API Endpoints

All admin endpoints are prefixed with `/api/admin/`:

### **Authentication**
- `POST /api/admin/auth/login` - Admin login
- `GET /api/admin/auth/me` - Get current admin profile
- `PUT /api/admin/auth/profile` - Update admin profile
- `PUT /api/admin/auth/change-password` - Change password
- `POST /api/admin/auth/logout` - Logout

### **Dashboard**
- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/dashboard/charts` - Get chart data
- `GET /api/admin/dashboard/activity` - Get recent activity

### **Complaints Management**
- `GET /api/admin/complaints` - Get all complaints with filtering
- `GET /api/admin/complaints/:id` - Get single complaint details
- `PUT /api/admin/complaints/:id/status` - Update complaint status
- `PUT /api/admin/complaints/:id/assign` - Assign complaint to admin

### **User Management**
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get single user details
- `PUT /api/admin/users/:id/status` - Update user status (activate/deactivate)
- `GET /api/admin/users/stats` - Get user statistics
- `GET /api/admin/users/:id/complaints` - Get user's complaints

### **Notifications**
- `GET /api/admin/notifications/templates` - Get notification templates
- `POST /api/admin/notifications/templates` - Create notification template
- `PUT /api/admin/notifications/templates/:id` - Update notification template
- `DELETE /api/admin/notifications/templates/:id` - Delete notification template
- `GET /api/admin/notifications/history` - Get notification history
- `POST /api/admin/notifications/send` - Send notifications
- `GET /api/admin/notifications/stats` - Get notification statistics

## 🔧 Frontend Integration

### 1. **Update API Base URL**

In your frontend application, update the API base URL:

```javascript
// In your frontend config
const API_BASE_URL = 'http://localhost:5000/api';
```

### 2. **Authentication Integration**

Update your login component to use the admin authentication:

```javascript
// Admin login API call
const adminLogin = async (credentials) => {
  const response = await fetch(`${API_BASE_URL}/admin/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Store token in localStorage
    localStorage.setItem('adminToken', data.token);
    localStorage.setItem('adminData', JSON.stringify(data.admin));
    return data;
  }
  
  throw new Error(data.message);
};
```

### 3. **API Request Helper**

Create a helper function for authenticated admin requests:

```javascript
const adminApiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('adminToken');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };
  
  const response = await fetch(`${API_BASE_URL}/admin${endpoint}`, config);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  
  return data;
};
```

### 4. **Dashboard Integration**

Update your dashboard component:

```javascript
// Dashboard stats
const fetchDashboardStats = async () => {
  try {
    const data = await adminApiRequest('/dashboard');
    setStats(data.data.overview);
    setChartsData(data.data);
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
  }
};

// Dashboard charts
const fetchDashboardCharts = async (period = '6months') => {
  try {
    const data = await adminApiRequest(`/dashboard/charts?period=${period}`);
    setChartsData(data.data);
  } catch (error) {
    console.error('Failed to fetch charts data:', error);
  }
};
```

### 5. **Complaints Management**

Update your complaints page:

```javascript
// Fetch complaints
const fetchComplaints = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters);
    const data = await adminApiRequest(`/complaints?${queryParams}`);
    setComplaints(data.data);
    setPagination(data.pagination);
  } catch (error) {
    console.error('Failed to fetch complaints:', error);
  }
};

// Update complaint status
const updateComplaintStatus = async (complaintId, status, notes) => {
  try {
    const data = await adminApiRequest(`/complaints/${complaintId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    });
    return data;
  } catch (error) {
    console.error('Failed to update complaint status:', error);
    throw error;
  }
};
```

### 6. **User Management**

Update your users page:

```javascript
// Fetch users
const fetchUsers = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters);
    const data = await adminApiRequest(`/users?${queryParams}`);
    setUsers(data.data);
    setPagination(data.pagination);
  } catch (error) {
    console.error('Failed to fetch users:', error);
  }
};

// Update user status
const updateUserStatus = async (userId, isActive) => {
  try {
    const data = await adminApiRequest(`/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ isActive }),
    });
    return data;
  } catch (error) {
    console.error('Failed to update user status:', error);
    throw error;
  }
};
```

### 7. **Notifications Integration**

Update your notifications page:

```javascript
// Fetch notification templates
const fetchTemplates = async () => {
  try {
    const data = await adminApiRequest('/notifications/templates');
    setTemplates(data.data);
  } catch (error) {
    console.error('Failed to fetch templates:', error);
  }
};

// Create notification template
const createTemplate = async (templateData) => {
  try {
    const data = await adminApiRequest('/notifications/templates', {
      method: 'POST',
      body: JSON.stringify(templateData),
    });
    return data;
  } catch (error) {
    console.error('Failed to create template:', error);
    throw error;
  }
};

// Send notification
const sendNotification = async (notificationData) => {
  try {
    const data = await adminApiRequest('/notifications/send', {
      method: 'POST',
      body: JSON.stringify(notificationData),
    });
    return data;
  } catch (error) {
    console.error('Failed to send notification:', error);
    throw error;
  }
};
```

## 🗄️ Database Models Added

The following models have been added to your existing database:

### **Admin Model**
- Authentication and authorization
- Role-based permissions
- Profile management

### **Notification Model**
- Template-based notifications
- Multi-channel support (email, push)
- Delivery tracking

### **NotificationTemplate Model**
- Reusable notification templates
- Variable substitution
- Category organization

## 🔒 Security Features

- JWT-based authentication for admins
- Role-based access control (admin, super_admin)
- Permission-based authorization
- Password hashing with bcrypt
- Input validation and sanitization

## 🧪 Testing the Integration

### 1. **Test Admin Login**
```bash
curl -X POST http://localhost:5000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mycity.gov","password":"admin123"}'
```

### 2. **Test Dashboard Stats**
```bash
curl -X GET http://localhost:5000/api/admin/dashboard \
  -H "Authorization: Bearer <your-admin-token>"
```

### 3. **Test Complaints List**
```bash
curl -X GET http://localhost:5000/api/admin/complaints \
  -H "Authorization: Bearer <your-admin-token>"
```

## 📊 Response Format

All API responses follow this format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

## 🚨 Error Handling

Implement proper error handling in your frontend:

```javascript
const handleAdminApiError = (error) => {
  if (error.response?.status === 401) {
    // Unauthorized - redirect to login
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    window.location.href = '/login';
  } else if (error.response?.status === 403) {
    // Forbidden - show permission error
    showError('You do not have permission to perform this action');
  } else {
    // Generic error
    showError(error.message || 'An error occurred');
  }
};
```

## 🔄 What's Different

Instead of creating a separate admin backend, the admin functionality has been integrated into your existing CleanCityBackend server:

1. **Same server** - Uses your existing server.js and .env
2. **Same database** - Uses your existing MongoDB connection
3. **Same port** - Runs on your configured PORT (default 5000)
4. **Admin routes** - All admin endpoints are under `/api/admin/`
5. **Existing models** - Uses your existing User, Complaint, Category models
6. **New models** - Added Admin, Notification, NotificationTemplate models

## 🎯 Benefits

- **No separate server** to manage
- **Unified database** for all data
- **Consistent API** structure
- **Easy deployment** - just one server
- **Shared authentication** system
- **Unified logging** and monitoring

## 🚀 Deployment

Your existing deployment process remains the same:

1. Set production environment variables
2. Ensure MongoDB is accessible
3. Deploy the single server
4. Run `npm run admin-seed` to create admin users

The admin panel will be available at the same server URL with `/api/admin/` endpoints.

## 📞 Support

For issues and questions:
1. Check the API responses for error messages
2. Verify admin credentials are seeded correctly
3. Ensure JWT tokens are being sent in requests
4. Check database connectivity
5. Verify environment configuration

The admin functionality is now fully integrated into your existing backend! 🎉
