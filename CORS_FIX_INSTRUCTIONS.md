# 🔧 CORS Fix Instructions - Render Deployment

## Problem
Your backend is blocking requests from your Netlify frontend due to CORS policy.

## Solution: Update Render Environment Variable

### Step 1: Go to Render Dashboard
1. Open https://dashboard.render.com
2. Click on your backend service: `crm-backend` (or `one0x-motors`)

### Step 2: Navigate to Environment Tab
1. Click on **"Environment"** tab in the left sidebar
2. Scroll down to see all environment variables

### Step 3: Update CORS_ORIGINS
1. Find the `CORS_ORIGINS` environment variable
2. Click on it to edit
3. Set the value to:
   ```
   https://10x-motors.netlify.app,http://localhost:3000
   ```
   ⚠️ **CRITICAL**: 
   - Include EXACTLY: `https://10x-motors.netlify.app` (with `https://` and no trailing slash)
   - Separate multiple origins with commas (no spaces after comma)
   - Include `http://localhost:3000` for local testing

4. Click **"Save Changes"**

### Step 4: Wait for Redeploy
- Render will automatically redeploy your backend
- Wait 1-2 minutes for deployment to complete
- Check the **"Logs"** tab to see deployment progress

### Step 5: Verify Fix
1. Go to your Netlify site: https://10x-motors.netlify.app
2. Open browser console (F12)
3. Try to login
4. CORS error should be gone ✅

---

## Verification Checklist

After updating, verify these in Render logs:

✅ **Check 1: CORS Origins Logged**
Look for this line in Render logs:
```
CORS Origins configured: [ 'https://10x-motors.netlify.app', 'http://localhost:3000' ]
```

✅ **Check 2: Server Running**
Look for:
```
Server running on port 10000
Connected to MongoDB
```

✅ **Check 3: No CORS Block Messages**
You should NOT see:
```
CORS blocked origin: https://10x-motors.netlify.app
```

---

## If Still Not Working

### Option 1: Check Exact URL Match
- Make sure the URL in `CORS_ORIGINS` matches EXACTLY what's in the browser
- Check for typos: `10x-motors` vs `one0x-motors`

### Option 2: Temporarily Allow All Origins (Testing Only)
For testing, you can temporarily set:
```
CORS_ORIGINS=*
```
⚠️ **WARNING**: Remove this after testing and set specific origins!

### Option 3: Check Render Logs
After redeploy, check logs for:
- CORS configuration messages
- Any errors during startup
- Network connection issues

---

## Example Environment Variables in Render

Your complete environment variables should look like:

```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://parameshk_db_user:0lXLoA8ImM0Snr8m@cluster0.yjkbg8z.mongodb.net/crm
JWT_SECRET=fsd8Hsd72_sdgf9834sdjk!sdjfsdjk
JWT_EXPIRE=7d
CORS_ORIGINS=https://10x-motors.netlify.app,http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## Quick Test

After updating, test the backend directly:

```bash
curl -X OPTIONS https://one0x-motors.onrender.com/api/auth/login \
  -H "Origin: https://10x-motors.netlify.app" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

You should see `Access-Control-Allow-Origin: https://10x-motors.netlify.app` in the response headers.

