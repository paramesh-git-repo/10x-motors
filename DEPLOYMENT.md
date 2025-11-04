# Deployment Guide for 10x Motors Care CRM

This guide explains how to deploy the CRM system to Netlify (Frontend) and Render (Backend).

## Prerequisites

1. GitHub repository: https://github.com/paramesh-git-repo/10x-motors.git
2. Netlify account: https://netlify.com
3. Render account: https://render.com
4. MongoDB Atlas account (for production database): https://www.mongodb.com/cloud/atlas

---

## Part 1: Deploy Backend to Render

### Step 1: Create MongoDB Atlas Database

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster (M0 Sandbox)
3. Create a database user
4. Whitelist IP addresses (or use 0.0.0.0/0 for all IPs)
5. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/crm?retryWrites=true&w=majority`)

#### Option 1 — (Recommended) Use MongoDB Atlas URI

**Format:**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name
```

**Example:**
```
MONGODB_URI=mongodb+srv://parameshk_db_user:0lXLoA8ImM0Snr8m@cluster0.yjkbg8z.mongodb.net/crm
```

**⚠️ Important Requirements:**

1. **Password URL Encoding**: If your password contains special characters like `@`, `%`, `#`, `!`, `&`, `=`, `+`, `?`, `/`, you MUST URL-encode them:
   - Example: Password `my@pass#123` becomes `my%40pass%23123`
   - Use `encodeURIComponent()` in JavaScript or an online URL encoder
   - Your current password (`0lXLoA8ImM0Snr8m`) ✅ **No encoding needed** (no special characters)

2. **Network Access**: MongoDB Atlas network access MUST allow:
   - ✅ **Allow all IPs**: `0.0.0.0/0` (recommended for Render)
   - OR at least your Render service IPs
   - Go to: MongoDB Atlas → **Network Access** → **Add IP Address**
   - **⚠️ Without proper network access, your backend will fail to connect!**

3. **Database Name**: 
   - Always include `/crm` at the end of your connection string
   - The database name (`crm`) will be auto-created on first write if it doesn't exist

### Step 2: Deploy Backend on Render

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository: `paramesh-git-repo/10x-motors`
4. Configure the service:
   - **Name**: `crm-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (or paid for better performance)

5. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb+srv://your-connection-string-here
   JWT_SECRET=your-very-secure-random-secret-key-here
   JWT_EXPIRE=7d
   CORS_ORIGINS=https://your-netlify-app.netlify.app
   ```

6. Click "Create Web Service"
7. Wait for deployment (usually 2-3 minutes)
8. **Copy your Render backend URL** (e.g., `https://crm-backend.onrender.com`)

---

## Part 2: Deploy Frontend to Netlify

### Step 1: Deploy Frontend on Netlify

1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub and select `paramesh-git-repo/10x-motors`
4. Configure build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`

5. Add Environment Variables:
   ```
   VITE_API_BASE_URL=https://your-render-backend-url.onrender.com/api
   ```
   (Replace with your actual Render backend URL)

6. Click "Deploy site"
7. Wait for deployment (usually 2-3 minutes)
8. **Copy your Netlify frontend URL** (e.g., `https://10x-motors.netlify.app`)

### Step 2: Update Backend CORS Settings

1. Go back to Render dashboard
2. Edit your backend service
3. Update the `CORS_ORIGINS` environment variable to include your Netlify URL:
   ```
   CORS_ORIGINS=https://your-netlify-app.netlify.app
   ```
4. Save and redeploy

---

## Part 3: Create First Admin User

After both services are deployed:

### Option 1: Using Render Shell

1. In Render dashboard, open your backend service
2. Click "Shell" tab
3. Run:
   ```bash
   node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('your-password', 10));"
   ```
4. Copy the hashed password
5. Connect to MongoDB Atlas and insert:
   ```javascript
   db.users.insertOne({
     name: "Admin",
     email: "admin@10xmotors.com",
     password: "paste-hashed-password-here",
     role: "admin",
     isActive: true,
     createdAt: new Date(),
     updatedAt: new Date()
   })
   ```

### Option 2: Using API Endpoint

Create a temporary registration endpoint or use MongoDB Atlas UI to insert the user directly.

---

## Part 4: Verify Deployment

1. Visit your Netlify frontend URL
2. Try logging in with the admin credentials
3. Test creating a customer, service, and invoice
4. Check that API calls are working in browser DevTools Network tab

---

## Troubleshooting

### Backend Issues

- **503 Error**: Render free tier sleeps after 15 minutes of inactivity. First request may take 30-60 seconds
- **Database Connection Error**: Check MongoDB Atlas IP whitelist and connection string
- **CORS Errors**: Ensure CORS_ORIGINS includes your Netlify URL

### Frontend Issues

- **API Not Found**: Check VITE_API_BASE_URL environment variable in Netlify
- **Build Fails**: Check Netlify build logs for missing dependencies
- **Blank Page**: Check browser console for errors

### Common Fixes

1. **Update CORS after deployment**:
   ```
   CORS_ORIGINS=https://your-netlify-app.netlify.app
   ```

2. **Clear Netlify cache**:
   - Site settings → Build & deploy → Clear cache and deploy

3. **Check environment variables**:
   - Both services must have correct environment variables set

---

## Production Checklist

- [ ] MongoDB Atlas cluster created and configured
- [ ] Backend deployed on Render
- [ ] Frontend deployed on Netlify
- [ ] Environment variables configured correctly
- [ ] CORS settings updated
- [ ] Admin user created
- [ ] SSL/HTTPS enabled (automatic on Netlify and Render)
- [ ] Test login and basic operations
- [ ] Monitor Render logs for errors

---

## Cost Estimate

- **Netlify**: Free tier (100GB bandwidth, 300 build minutes/month)
- **Render**: Free tier (750 hours/month, services sleep after inactivity)
- **MongoDB Atlas**: Free tier (512MB storage)

**Total Cost: $0/month** (free tier)

For production with higher traffic, consider:
- Render paid plan: $7/month (always-on service)
- MongoDB Atlas M10: $57/month (better performance)

---

## Support

For issues:
1. Check Render logs: Dashboard → Service → Logs
2. Check Netlify build logs: Site → Deploys → Build log
3. Check browser console for frontend errors
4. Verify environment variables are set correctly
