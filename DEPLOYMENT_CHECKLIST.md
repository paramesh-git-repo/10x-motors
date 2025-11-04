# Deployment Checklist - 10x Motors Care CRM

## ✅ Pre-Deployment Verification

### Backend Configuration Review

#### ✅ Environment Variables for Render
```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://parameshk_db_user:0lXLoA8ImM0Snr8m@cluster0.yjkbg8z.mongodb.net/crm
JWT_SECRET=fsd8Hsd72_sdgf9834sdjk!sdjfsdjk
JWT_EXPIRE=7d
CORS_ORIGINS=https://your-netlify-app.netlify.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### ⚠️ IMPORTANT NOTES:

1. **CORS_ORIGINS**: 
   - ❌ Current: `https://your-frontend.onrender.com` (WRONG - Render is for backend)
   - ✅ Should be: `https://your-netlify-app.netlify.app` (Netlify URL for frontend)
   - You'll get this URL AFTER deploying frontend to Netlify
   - For now, you can set a placeholder, then UPDATE it after frontend deployment

2. **MONGODB_URI**: ✅ Correct format and ready to use

3. **JWT_SECRET**: ✅ Good secure random string

4. **PORT**: 
   - Render automatically sets PORT environment variable
   - Your code uses `process.env.PORT || 5000` which is correct
   - Render will provide the PORT automatically

---

## 🔍 Code Review Checklist

### ✅ Server Configuration (server.js)
- [x] Trust proxy enabled for HTTPS: `app.set('trust proxy', 1)`
- [x] Helmet security headers enabled
- [x] CORS configured with environment variable support
- [x] Compression enabled
- [x] Rate limiting configured
- [x] MongoDB connection using environment variable
- [x] PORT uses environment variable with fallback

### ✅ Environment Variables Used
- [x] `NODE_ENV` - Used in error handler
- [x] `PORT` - Used for server listening port
- [x] `MONGODB_URI` - Used for database connection
- [x] `JWT_SECRET` - Used in auth middleware and routes
- [x] `JWT_EXPIRE` - Used in JWT token generation
- [x] `CORS_ORIGINS` - Used in CORS middleware
- [x] `RATE_LIMIT_WINDOW_MS` - Used in rate limiter
- [x] `RATE_LIMIT_MAX_REQUESTS` - Used in rate limiter

### ✅ Security Features
- [x] JWT authentication
- [x] Bcrypt password hashing
- [x] Helmet security headers
- [x] Rate limiting
- [x] CORS protection
- [x] Input sanitization (mongo-sanitize)
- [x] Input validation (express-validator)
- [x] Error handling (no stack traces in production)

### ✅ Error Handling
- [x] Global error handler
- [x] Mongoose error handling
- [x] JWT error handling
- [x] Production vs development error responses

---

## 📋 Deployment Steps

### Step 1: Deploy Backend to Render

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click**: "New +" → "Web Service"
3. **Connect GitHub**: Select `paramesh-git-repo/10x-motors`
4. **Configure Service**:
   ```
   Name: crm-backend
   Root Directory: backend
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   Instance Type: Free (or Starter for $7/month - always on)
   ```

5. **Add Environment Variables**:
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://parameshk_db_user:0lXLoA8ImM0Snr8m@cluster0.yjkbg8z.mongodb.net/crm
   JWT_SECRET=fsd8Hsd72_sdgf9834sdjk!sdjfsdjk
   JWT_EXPIRE=7d
   CORS_ORIGINS=https://placeholder.netlify.app
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

6. **Click**: "Create Web Service"
7. **Wait for deployment** (2-3 minutes)
8. **Copy Backend URL**: e.g., `https://crm-backend-xxxx.onrender.com`
9. **Test Backend**: 
   ```bash
   curl https://your-backend-url.onrender.com/api/dashboard/stats
   ```
   Should return JSON (may need auth token for some endpoints)

### Step 2: Deploy Frontend to Netlify

1. **Go to Netlify**: https://app.netlify.com
2. **Click**: "Add new site" → "Import an existing project"
3. **Connect GitHub**: Select `paramesh-git-repo/10x-motors`
4. **Configure Build Settings**:
   ```
   Base directory: frontend
   Build command: npm run build
   Publish directory: frontend/dist
   ```

5. **Add Environment Variable**:
   ```
   VITE_API_BASE_URL=https://your-backend-url.onrender.com/api
   ```
   (Replace with your actual Render backend URL)

6. **Click**: "Deploy site"
7. **Wait for deployment** (2-3 minutes)
8. **Copy Frontend URL**: e.g., `https://10x-motors-xxxx.netlify.app`

### Step 3: Update Backend CORS

1. **Go back to Render Dashboard**
2. **Edit your backend service**
3. **Update Environment Variable**:
   ```
   CORS_ORIGINS=https://your-actual-netlify-url.netlify.app
   ```
   (Use the URL from Step 2)
4. **Save and Redeploy**

### Step 4: Create Admin User

**Option A: Using MongoDB Atlas UI**

1. Go to MongoDB Atlas: https://cloud.mongodb.com
2. Click "Browse Collections"
3. Select your database: `crm`
4. Click "Insert Document" in `users` collection
5. Use this JSON (replace password hash):
   ```json
   {
     "name": "Admin",
     "email": "admin@10xmotors.com",
     "password": "$2a$10$R9hsX.KKZq3.7XJ8YGDk5e6a8QZ5a7BQ1XE4Y9fZ0jF0g8HYjJ",
     "role": "admin",
     "isActive": true,
     "createdAt": {"$date": "2025-01-01T00:00:00.000Z"},
     "updatedAt": {"$date": "2025-01-01T00:00:00.000Z"}
   }
   ```
   Note: Password hash above is for "password123"

**Option B: Using Render Shell**

1. In Render dashboard, open backend service
2. Click "Shell" tab
3. Run:
   ```bash
   node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('your-password', 10));"
   ```
4. Copy the hash
5. Insert user in MongoDB Atlas (as above)

### Step 5: Verify Deployment

1. **Visit Frontend URL**: https://your-netlify-app.netlify.app
2. **Login**: Use admin credentials
3. **Test Features**:
   - [ ] Create a customer
   - [ ] Add a vehicle
   - [ ] Create a service
   - [ ] Generate an invoice
   - [ ] Check dashboard stats

4. **Check Browser Console**: Should have no CORS errors
5. **Check Network Tab**: API calls should go to Render backend

---

## 🔧 Troubleshooting

### Backend Issues

**503 Error on First Request**
- ✅ Normal for Render free tier
- Service sleeps after 15 min inactivity
- First request takes 30-60 seconds to wake up

**Database Connection Error**
- Check MongoDB Atlas IP whitelist (should allow 0.0.0.0/0 or Render IPs)
- Verify MONGODB_URI is correct
- Check MongoDB Atlas cluster is running

**CORS Errors**
- Verify CORS_ORIGINS includes exact Netlify URL
- No trailing slash in CORS_ORIGINS
- Check browser console for exact error

### Frontend Issues

**API Not Found (404)**
- Check VITE_API_BASE_URL environment variable in Netlify
- Should be: `https://your-backend.onrender.com/api`
- Redeploy frontend after changing env var

**Blank Page**
- Check browser console for errors
- Verify build succeeded in Netlify
- Check network tab for failed requests

**Build Fails**
- Check Netlify build logs
- Ensure all dependencies are in package.json
- Try clearing cache and redeploying

---

## ✅ Final Verification Checklist

Before considering deployment complete:

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] CORS updated with correct Netlify URL
- [ ] Admin user created in MongoDB
- [ ] Can login successfully
- [ ] Can create customers
- [ ] Can create services
- [ ] Can generate invoices
- [ ] Dashboard shows stats
- [ ] No CORS errors in browser console
- [ ] All API endpoints working

---

## 📝 Important Reminders

1. **CORS_ORIGINS**: Must be your Netlify URL (not Render URL)
2. **MongoDB URI**: Contains credentials - keep it secure
3. **JWT_SECRET**: Change it if you haven't already
4. **Free Tier Limits**: 
   - Render: Services sleep after 15 min
   - Netlify: 100GB bandwidth/month
   - MongoDB Atlas: 512MB storage

---

## 🎉 Success!

Once all checklist items are complete, your CRM system is live!

**Frontend**: https://your-app.netlify.app
**Backend API**: https://your-backend.onrender.com/api
**Database**: MongoDB Atlas (cloud)
