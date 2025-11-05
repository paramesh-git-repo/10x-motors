# Fix Netlify Login Issues

## 🔴 Current Error

```
POST https://one0x-motors.onrender.com/api/api/auth/login
```

**Issues:**
1. Double `/api` in URL (should be `/api/auth/login`)
2. CORS error - Netlify origin not allowed

## ✅ Solutions

### Fix 1: Netlify Environment Variable

**Problem:** `VITE_API_URL` includes `/api`, causing double `/api/api`

**Solution:**
1. Go to Netlify Dashboard
2. Select site: `10x-motors`
3. Go to: **Site settings** → **Environment variables**
4. Add/Update:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://one0x-motors.onrender.com`
   - ⚠️ **IMPORTANT:** NO `/api` at the end!
5. Go to **Deploys** tab
6. Click **Trigger deploy** → **Clear cache and deploy site**

### Fix 2: Render CORS Configuration

**Problem:** Backend not allowing Netlify origin

**Solution:**
1. Go to Render Dashboard
2. Select your backend service: `crm-backend`
3. Go to **Environment** tab
4. Add/Update:
   - **Key:** `CORS_ORIGINS`
   - **Value:** `https://10x-motors.netlify.app`
   - Or if you have multiple: `http://localhost:3000,https://10x-motors.netlify.app`
5. Click **Save Changes**
6. Backend will auto-redeploy

## ✅ After Fixes

1. **Netlify:** Frontend will call `https://one0x-motors.onrender.com/api/auth/login` ✅
2. **Render:** Backend will allow requests from `https://10x-motors.netlify.app` ✅
3. **Login:** Should work! ✅

## 🧪 Test

After both fixes:
1. Wait for deployments to complete
2. Go to: https://10x-motors.netlify.app/login
3. Try logging in with: `admin@example.com` / `password123`
4. Check browser console - should see successful API call

## 📝 Quick Checklist

- [ ] Netlify: `VITE_API_URL=https://one0x-motors.onrender.com` (no /api)
- [ ] Netlify: Redeployed after setting env var
- [ ] Render: `CORS_ORIGINS=https://10x-motors.netlify.app`
- [ ] Render: Backend redeployed after setting env var
- [ ] Test login on Netlify URL

