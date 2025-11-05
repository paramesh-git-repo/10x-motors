# Render Deployment Troubleshooting Guide

## 🔴 Common Errors & Solutions

### 1. Server Not Starting / Port Issues

**Error:** "Server failed to start" or "Cannot connect"

**Solution:**
- ✅ Server must listen on `0.0.0.0` (already fixed in server.js)
- ✅ PORT must use `process.env.PORT` (already configured)
- ✅ Check Render logs for specific error

### 2. MongoDB Connection Failed

**Error:** "MongoDB connection error" or "ECONNREFUSED"

**Solution:**
1. Verify MONGODB_URI in Render Environment Variables:
   ```
   mongodb+srv://parameshk_db_user:0lXLoA8ImM0Snr8m@cluster0.yjkbg8z.mongodb.net/crm
   ```

2. Check MongoDB Atlas:
   - ✅ Network Access: Add Render IP (0.0.0.0/0 for all IPs)
   - ✅ Database User: Verify username/password
   - ✅ Database name: Should be "crm"

3. Test connection string format:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/database
   ```

### 3. Missing Environment Variables

**Required Variables in Render:**
```
NODE_ENV=production
PORT=10000 (or Render assigned port)
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
CORS_ORIGINS=https://10x-motors.netlify.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
FRONTEND_URL=https://10x-motors.netlify.app
```

**Optional (for email):**
```
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM="10x Motors Care <your-email@gmail.com>"
```

### 4. CORS Errors

**Error:** "Access-Control-Allow-Origin" errors

**Solution:**
- ✅ Add your Netlify URL to CORS_ORIGINS
- ✅ Format: `https://10x-motors.netlify.app` (no trailing slash)
- ✅ Multiple origins: `https://site1.netlify.app,https://site2.netlify.app`

### 5. Build/Docker Errors

**Error:** Docker build fails or npm install errors

**Solution:**
- ✅ Check render.yaml is correct
- ✅ Verify Dockerfile path: `./backend/Dockerfile`
- ✅ Verify docker context: `./backend`
- ✅ Check package.json has all dependencies

### 6. Health Check Failures

**Error:** "Health check failed"

**Solution:**
- ✅ Verify `/api/health` endpoint works
- ✅ Check server is listening on correct port
- ✅ Ensure server responds to GET requests

## 🔧 How to Check Render Logs

1. Go to Render Dashboard
2. Click on your service
3. Go to "Logs" tab
4. Look for:
   - Red errors (connection issues)
   - Yellow warnings (deprecation warnings - usually OK)
   - Green messages (successful connections)

## ✅ Quick Fixes Checklist

- [ ] Server listens on `0.0.0.0` (already fixed)
- [ ] PORT uses `process.env.PORT` (already configured)
- [ ] MONGODB_URI is set in Render
- [ ] JWT_SECRET is set in Render
- [ ] CORS_ORIGINS includes Netlify URL
- [ ] MongoDB Atlas allows all IPs (0.0.0.0/0)
- [ ] Database user has correct permissions
- [ ] All environment variables are set

## 📝 Step-by-Step Render Setup

1. **Create Web Service:**
   - Connect GitHub repo
   - Select "Docker" environment
   - Set dockerfilePath: `./backend/Dockerfile`
   - Set dockerContext: `./backend`

2. **Set Environment Variables:**
   - Go to "Environment" tab
   - Add all required variables (see above)

3. **Deploy:**
   - Click "Manual Deploy" or wait for auto-deploy
   - Watch logs for errors

4. **Verify:**
   - Check health endpoint: `https://your-service.onrender.com/api/health`
   - Should return: `{"status":"ok","timestamp":"..."}`

## 🆘 Still Having Issues?

1. Check Render logs for specific error message
2. Verify MongoDB connection string
3. Test health endpoint manually
4. Check environment variables are set correctly
5. Verify CORS_ORIGINS matches your Netlify URL exactly

