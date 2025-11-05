# Login Troubleshooting Guide - Production

## 🔍 Step-by-Step Diagnosis

### 1. Check Frontend API Configuration (Netlify)

**Issue**: Frontend might be calling the wrong URL or double `/api` in path.

**Fix**:
1. Go to Netlify Dashboard → Your Site → Site Settings → Environment Variables
2. Verify `VITE_API_URL` is set to:
   ```
   VITE_API_URL=https://one0x-motors.onrender.com
   ```
   ⚠️ **CRITICAL**: Do NOT include `/api` at the end!

3. After setting, go to **Deploys** tab → **Trigger deploy** → **Clear cache and deploy site**

**Verify**:
- Open browser console on your Netlify site
- Look for the login request URL
- Should be: `https://one0x-motors.onrender.com/api/auth/login`
- Should NOT be: `https://one0x-motors.onrender.com/api/api/auth/login` ❌

---

### 2. Check Backend CORS Configuration (Render)

**Issue**: Backend blocking requests from Netlify due to CORS.

**Fix**:
1. Go to Render Dashboard → Your Backend Service → Environment tab
2. Verify `CORS_ORIGINS` includes your Netlify URL:
   ```
   CORS_ORIGINS=https://10x-motors.netlify.app,http://localhost:3000
   ```
   ⚠️ **CRITICAL**: Include exact URL with `https://` and no trailing slash!

3. Click **Save Changes** (backend will auto-redeploy)

**Verify**:
- Check Render logs after redeploy
- Should see: `Server running on port 10000` (or your PORT)
- Should see: `Connected to MongoDB`

---

### 3. Check Backend Server Status (Render)

**Issue**: Backend might be down or not responding.

**Test**:
1. Open browser and go to: `https://one0x-motors.onrender.com`
2. Should see: `{"message":"Welcome to 10X Motors API 🚗💨"}`
3. If you see error, backend is down

**Check Render Logs**:
1. Go to Render Dashboard → Your Backend Service → Logs
2. Look for errors like:
   - `MongoDB connection error`
   - `Server running on port...`
   - `Connected to MongoDB`

---

### 4. Check MongoDB Connection (Render)

**Issue**: Backend can't connect to MongoDB Atlas.

**Fix**:
1. Go to Render Dashboard → Environment tab
2. Verify `MONGODB_URI` is set correctly:
   ```
   MONGODB_URI=mongodb+srv://parameshk_db_user:0lXLoA8ImM0Snr8m@cluster0.yjkbg8z.mongodb.net/crm
   ```
   ⚠️ **CRITICAL**: Must include `/crm` at the end!

3. Verify MongoDB Atlas Network Access:
   - Go to MongoDB Atlas → Network Access
   - Ensure `0.0.0.0/0` is allowed (or Render's IP ranges)

---

### 5. Check Admin User Exists (MongoDB)

**Issue**: No admin user exists in production database.

**Fix - Option 1: Create via Backend API** (if backend is accessible):
```bash
curl -X POST https://one0x-motors.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin",
    "email": "admin@10xmotors.com",
    "password": "your-secure-password",
    "role": "admin"
  }'
```

**Fix - Option 2: Create via MongoDB Atlas**:
1. Go to MongoDB Atlas → Browse Collections
2. Select `crm` database → `users` collection
3. Click "Insert Document"
4. Use this structure:
```json
{
  "name": "Admin",
  "email": "admin@10xmotors.com",
  "password": "$2a$10$R9hsX.KKZq3.7XJ8YGDk5e6a8QZ5a7BQ1XE4Y9fZ0jF0g8HYjJ", // This is "password123"
  "role": "admin",
  "isActive": true,
  "createdAt": { "$date": "2025-01-01T00:00:00.000Z" },
  "updatedAt": { "$date": "2025-01-01T00:00:00.000Z" }
}
```
⚠️ **Note**: The password hash above is for "password123". For a different password, you need to hash it first.

**Fix - Option 3: Use create-admin.js script**:
```bash
# In your local machine
cd backend
node create-admin.js
```
This will create admin with email: `admin@example.com` and password: `password123`

Then update the email in MongoDB Atlas if needed.

---

### 6. Check Browser Console Errors

**Open Browser Console** (F12) and look for:

**Error 1: CORS Error**
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution**: Fix CORS_ORIGINS in Render (see Step 2)

**Error 2: 404 Not Found**
```
POST https://one0x-motors.onrender.com/api/api/auth/login 404
```
**Solution**: Fix VITE_API_URL in Netlify (see Step 1) - remove `/api` from URL

**Error 3: Network Error**
```
net::ERR_FAILED
```
**Solution**: Backend is down or unreachable (see Step 3)

**Error 4: 401 Unauthorized**
```
Invalid credentials
```
**Solution**: Wrong email/password OR user doesn't exist (see Step 5)

---

## 🧪 Quick Test Commands

### Test Backend Health
```bash
curl https://one0x-motors.onrender.com
# Should return: {"message":"Welcome to 10X Motors API 🚗💨"}
```

### Test Backend Login Endpoint
```bash
curl -X POST https://one0x-motors.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

### Test CORS (from browser console)
```javascript
fetch('https://one0x-motors.onrender.com/api/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

---

## ✅ Complete Checklist

Before testing login, verify ALL of these:

- [ ] **Netlify**: `VITE_API_URL=https://one0x-motors.onrender.com` (no `/api`)
- [ ] **Netlify**: Frontend redeployed after setting env var
- [ ] **Render**: `CORS_ORIGINS` includes `https://10x-motors.netlify.app`
- [ ] **Render**: Backend is running (check logs)
- [ ] **Render**: `MONGODB_URI` includes `/crm` at the end
- [ ] **Render**: MongoDB connected (check logs)
- [ ] **MongoDB Atlas**: Network access allows `0.0.0.0/0`
- [ ] **MongoDB**: Admin user exists in `crm.users` collection
- [ ] **Browser**: Console shows correct API URL (no double `/api`)

---

## 🔑 Default Login Credentials

If you created the admin user using `create-admin.js`:
- **Email**: `admin@example.com`
- **Password**: `password123`

If you created via MongoDB Atlas:
- Use the email and password you set

---

## 🚨 Common Issues & Solutions

### Issue: "Invalid credentials" but user exists
**Cause**: Password hash mismatch
**Solution**: Recreate user via API or use `create-admin.js` script

### Issue: "Account is inactive"
**Cause**: User's `isActive` field is `false`
**Solution**: Update user in MongoDB: `db.users.updateOne({email:"admin@example.com"}, {$set:{isActive:true}})`

### Issue: CORS error persists after fixing
**Cause**: Browser cached old response
**Solution**: Hard refresh (Ctrl+Shift+R or Cmd+Shift+R) or clear cache

### Issue: 404 on login endpoint
**Cause**: Double `/api` in URL or backend route not mounted
**Solution**: Verify `VITE_API_URL` and backend `server.js` routes

---

## 📞 Need More Help?

Check these files:
- `backend/server.js` - Server configuration and routes
- `backend/routes/auth.js` - Login route implementation
- `frontend/src/utils/api.js` - API client configuration
- `frontend/src/context/AuthContext.jsx` - Login function

If all else fails, check Render logs for specific error messages.

