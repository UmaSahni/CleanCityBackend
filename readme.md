# CleanCity Backend API

A comprehensive civic issue tracking system built with Express.js, MongoDB, and Cloudinary. This API allows citizens to report, track, and view resolutions of civic issues in their neighborhood.

## 🚀 Features

- **User Authentication** - JWT-based authentication with role-based access
- **Complaint Management** - Create, track, and manage civic complaints
- **Image Upload** - Cloudinary integration for photo attachments
- **Admin Dashboard** - Comprehensive admin tools for complaint management
- **Public Transparency** - Public dashboard for resolved issues
- **Location Services** - GPS coordinates and address tracking
- **Status Workflow** - Track complaint progression from submission to resolution
- **Voting System** - Citizens can upvote/downvote complaints
- **Statistics & Analytics** - Detailed reporting and insights

## 📋 Table of Contents

- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Database Seeding](#database-seeding)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Usage Examples](#usage-examples)
- [Error Handling](#error-handling)
- [Contributing](#contributing)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/UmaSahni/CleanCityBackend.git
   cd CleanCityBackend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```

4. **Configure your environment variables in `.env`**
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/cleancity
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=30d
   CLOUDINARY_URL=cloudinary://<your_api_key>:<your_api_secret>@dnd6b7lfn
   ```

5. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 🌱 Database Seeding

Seed the database with initial categories and statuses:

```bash
npm run seed
```

This will create:
- 8 complaint categories (Roads, Waste Management, Water & Sewage, etc.)
- 6 status types (Submitted, Under Review, In Progress, Resolved, etc.)

## 📚 API Endpoints

### Base URL
```
http://localhost:5000/api
```

### 🔐 Authentication Endpoints

#### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "age": 25,
    "phone": "9876543210",
    "address": {
      "street": "123 Main St",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001"
    }
  }'
```

#### Login User
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### Get Current User
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

#### Update User Details
```bash
curl -X PUT http://localhost:5000/api/auth/updatedetails \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith",
    "phone": "9876543211"
  }'
```

#### Update Password
```bash
curl -X PUT http://localhost:5000/api/auth/updatepassword \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "password123",
    "newPassword": "newpassword123"
  }'
```

### 📋 Complaint Endpoints

#### Create Complaint
```bash
curl -X POST http://localhost:5000/api/complaints \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Pothole on Main Road",
    "description": "Large pothole causing traffic issues",
    "category": "CATEGORY_ID_HERE",
    "priority": "High",
    "location": {
      "lat": 19.0760,
      "lng": 72.8777,
      "address": "Main Road, Bandra West",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400050"
    },
    "photos": [
      {
        "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/photo1.jpg",
        "publicId": "photo1",
        "caption": "Pothole view"
      }
    ],
    "tags": ["road", "pothole", "traffic"],
    "isAnonymous": false
  }'
```

#### Get User's Complaints
```bash
curl -X GET "http://localhost:5000/api/complaints?page=1&limit=10&status=STATUS_ID&category=CATEGORY_ID&priority=High&sort=-createdAt" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

#### Get Single Complaint
```bash
curl -X GET http://localhost:5000/api/complaints/COMPLAINT_ID_HERE \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

#### Update Complaint
```bash
curl -X PUT http://localhost:5000/api/complaints/COMPLAINT_ID_HERE \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Pothole Issue",
    "description": "Updated description",
    "priority": "Critical"
  }'
```

#### Delete Complaint
```bash
curl -X DELETE http://localhost:5000/api/complaints/COMPLAINT_ID_HERE \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

#### Vote on Complaint
```bash
curl -X POST http://localhost:5000/api/complaints/COMPLAINT_ID_HERE/vote \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "vote": "up"
  }'
```

#### Get User Complaint Statistics
```bash
curl -X GET http://localhost:5000/api/complaints/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### 👨‍💼 Admin Endpoints

#### Get All Complaints (Admin)
```bash
curl -X GET "http://localhost:5000/api/admin/complaints?page=1&limit=10&status=STATUS_ID&category=CATEGORY_ID&priority=High&city=Mumbai&state=Maharashtra&search=pothole&sort=-createdAt" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN_HERE"
```

#### Get Admin Dashboard
```bash
curl -X GET http://localhost:5000/api/admin/dashboard \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN_HERE"
```

#### Get Complaint for Admin
```bash
curl -X GET http://localhost:5000/api/admin/complaints/COMPLAINT_ID_HERE \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN_HERE"
```

#### Update Complaint Status
```bash
curl -X PUT http://localhost:5000/api/admin/complaints/COMPLAINT_ID_HERE/status \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "STATUS_ID_HERE",
    "notes": "Work started on resolving the issue",
    "estimatedResolutionDate": "2024-11-01T00:00:00.000Z"
  }'
```

#### Assign Complaint to Admin
```bash
curl -X PUT http://localhost:5000/api/admin/complaints/COMPLAINT_ID_HERE/assign \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "adminId": "ADMIN_USER_ID_HERE"
  }'
```

### 🌐 Public Endpoints

#### Get Public Complaints
```bash
curl -X GET "http://localhost:5000/api/public/complaints?page=1&limit=10&category=CATEGORY_ID&city=Mumbai&state=Maharashtra&sort=-createdAt"
```

#### Get Public Statistics
```bash
curl -X GET http://localhost:5000/api/public/stats
```

#### Get Public Categories
```bash
curl -X GET http://localhost:5000/api/public/categories
```

#### Get Public Complaint Details
```bash
curl -X GET http://localhost:5000/api/public/complaints/COMPLAINT_ID_HERE
```

#### Search Public Complaints
```bash
curl -X GET "http://localhost:5000/api/public/search?q=pothole&page=1&limit=10&category=CATEGORY_ID&city=Mumbai&state=Maharashtra"
```

### 📂 Category Endpoints

#### Get All Categories
```bash
curl -X GET "http://localhost:5000/api/categories?isActive=true"
```

#### Get Single Category
```bash
curl -X GET http://localhost:5000/api/categories/CATEGORY_ID_HERE
```

#### Create Category (Admin)
```bash
curl -X POST http://localhost:5000/api/categories \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Category",
    "description": "Description for new category",
    "icon": "fas fa-icon",
    "color": "#FF5733"
  }'
```

#### Update Category (Admin)
```bash
curl -X PUT http://localhost:5000/api/categories/CATEGORY_ID_HERE \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Category Name",
    "description": "Updated description",
    "isActive": true
  }'
```

#### Delete Category (Admin)
```bash
curl -X DELETE http://localhost:5000/api/categories/CATEGORY_ID_HERE \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN_HERE"
```

#### Get Category Statistics
```bash
curl -X GET http://localhost:5000/api/categories/stats
```

### 🖼️ Upload Endpoints

#### Upload Single Image
```bash
curl -X POST http://localhost:5000/api/upload/image \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -F "image=@/path/to/your/image.jpg"
```

#### Upload Multiple Images
```bash
curl -X POST http://localhost:5000/api/upload/images \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg" \
  -F "images=@/path/to/image3.jpg"
```

#### Get Image Details
```bash
curl -X GET http://localhost:5000/api/upload/image/PUBLIC_ID_HERE \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

#### Delete Image
```bash
curl -X DELETE http://localhost:5000/api/upload/image/PUBLIC_ID_HERE \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### 🔧 Utility Endpoints

#### Get API Info
```bash
curl -X GET http://localhost:5000/api/
```

#### Health Check
```bash
curl -X GET http://localhost:5000/api/health
```

## 🔑 Authentication

### Getting JWT Token

1. **Register or Login** to get a JWT token
2. **Include token** in Authorization header for protected routes:
   ```bash
   -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
   ```

### User Roles

- **citizen** - Default role, can create and manage own complaints
- **admin** - Can manage all complaints, update statuses
- **super_admin** - Full system access

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description"
}
```

## 🔍 Query Parameters

### Pagination
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

### Filtering
- `status` - Filter by status ID
- `category` - Filter by category ID
- `priority` - Filter by priority (Low, Medium, High, Critical)
- `city` - Filter by city name
- `state` - Filter by state name
- `search` - Search in title, description, complaint number

### Sorting
- `sort` - Sort field with direction (e.g., `-createdAt`, `+title`)

## 🚨 Error Handling

The API uses comprehensive error handling with appropriate HTTP status codes:

- **400** - Bad Request (validation errors)
- **401** - Unauthorized (invalid/missing token)
- **403** - Forbidden (insufficient permissions)
- **404** - Not Found (resource doesn't exist)
- **500** - Internal Server Error

## 🛠️ Development

### Project Structure
```
backend/
├── config/           # Database and service configurations
├── controllers/      # Route controllers
├── middleware/       # Custom middleware
├── models/           # Database models
├── routes/           # API routes
├── scripts/          # Utility scripts
├── uploads/          # Temporary file storage
├── server.js         # Main server file
└── package.json      # Dependencies
```

### Available Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run seed       # Seed database with initial data
```

## 📝 Important Notes

1. **Replace Placeholders:**
   - `YOUR_JWT_TOKEN_HERE` - Get from login response
   - `ADMIN_JWT_TOKEN_HERE` - Admin user's JWT token
   - `COMPLAINT_ID_HERE` - Actual complaint ID
   - `CATEGORY_ID_HERE` - Actual category ID
   - `STATUS_ID_HERE` - Actual status ID

2. **Get IDs First:**
   ```bash
   # Get categories
   curl -X GET http://localhost:5000/api/categories
   
   # Get statuses (from admin dashboard)
   curl -X GET http://localhost:5000/api/admin/dashboard
   ```

3. **File Uploads:**
   - Use `-F` for multipart/form-data
   - Replace `/path/to/your/image.jpg` with actual file path

4. **Query Parameters:**
   - Use `"` around URLs with query parameters
   - Separate multiple parameters with `&`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support, email support@cleancity.com or create an issue in the repository.

---

**CleanCity Backend API** - Building better communities through technology! 🏙️✨