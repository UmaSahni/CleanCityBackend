# Render Deployment Guide for CleanCityBackend

## 🚀 Quick Fix Summary

The main issue was that Firebase configuration was trying to load a local JSON file, which doesn't work on Render. I've fixed this by:

1. ✅ Updated Firebase config to use environment variables in production
2. ✅ Added proper Node.js version constraints in package.json
3. ✅ Created render.yaml configuration file
4. ✅ Added proper error handling for Firebase initialization

## 📋 Environment Variables to Set in Render

Go to your Render service → Settings → Environment Variables and add:

### Required Variables:
- `MONGODB_URI` - Your MongoDB connection string
- `GOOGLE_APPLICATION_CREDENTIALS` - Your Firebase service account JSON (paste the entire JSON as the value)
- `JWT_SECRET` - Your JWT secret key
- `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Your Cloudinary API key
- `CLOUDINARY_API_SECRET` - Your Cloudinary API secret

### Optional Variables (already set in render.yaml):
- `NODE_ENV` - Set to "production"
- `PORT` - Set to 10000 (Render's default)
- `FIREBASE_DATABASE_URL` - Already configured
- `FIREBASE_STORAGE_BUCKET` - Already configured

## 🔧 Render Service Settings

In your Render service settings:

- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Node Version**: 18.x or 20.x (recommended)
- **Root Directory**: Leave blank (or set to the backend folder if deploying from monorepo)

## 🧪 Testing Locally

Before deploying, test locally:

```bash
# Set environment variables for testing
export NODE_ENV=production
export GOOGLE_APPLICATION_CREDENTIALS='{"type":"service_account",...}' # Your full JSON
export MONGODB_URI="your-mongodb-uri"
export JWT_SECRET="your-jwt-secret"

# Test the server
npm start
```

## 🚨 Common Issues & Solutions

### Issue 1: "Cannot find module firebase-admin"
**Solution**: The dependency is already in package.json. If it still fails, try:
- Clear Render cache and redeploy
- Check that firebase-admin is in dependencies (not devDependencies)

### Issue 2: "Firebase initialization error"
**Solution**: 
- Ensure GOOGLE_APPLICATION_CREDENTIALS is set correctly
- The JSON should be the complete service account JSON, not a file path
- Check that all required Firebase environment variables are set

### Issue 3: "MongoDB connection failed"
**Solution**:
- Ensure MONGODB_URI is set correctly
- Use the full connection string including authentication
- Test the connection string locally first

## 📝 Deployment Steps

1. **Commit all changes**:
   ```bash
   git add .
   git commit -m "Fix Firebase config for Render deployment"
   git push origin main
   ```

2. **Set environment variables** in Render dashboard

3. **Redeploy** - Render will automatically redeploy on push

4. **Check logs** for any remaining issues

## ✅ Success Indicators

You should see these logs on successful deployment:
```
==> Running 'npm install'
...
==> Starting service with 'npm start'
Firebase Admin initialized successfully
Firebase services initialized successfully
MongoDB Connected: [your-mongodb-host]
Server is running on port 10000
```

## 🔄 Rollback Plan

If deployment fails:
1. Go to Render Dashboard → Your Service → Events
2. Click "Rollback" to previous working version
3. Fix issues and redeploy

## 📞 Support

If you still get errors:
1. Check Render logs for specific error messages
2. Verify all environment variables are set correctly
3. Test Firebase credentials locally first
4. Ensure MongoDB URI is accessible from Render's IP ranges
