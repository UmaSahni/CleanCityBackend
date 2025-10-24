GET  /api/firebase/test/connection     - Test Firebase connection
POST /api/firebase/test/firestore/write - Test Firestore write
GET  /api/firebase/test/firestore/read  - Test Firestore read
POST /api/firebase/users                - Create Firebase user
GET  /api/firebase/users/:uid          - Get user by UID
PUT  /api/firebase/users/:uid          - Update user
DELETE /api/firebase/users/:uid        - Delete user
POST /api/firebase/custom-token        - Generate custom token
POST /api/firebase/verify-token        - Verify ID token
GET  /api/firebase/protected           - Protected route


Start your server and visit:
http://localhost:5000/api/firebase/test/connection - Test Firebase connection
http://localhost:5000/api/firebase/test/firestore/write - Test database write
http://localhost:5000/api/firebase/test/firestore/read - Test database read