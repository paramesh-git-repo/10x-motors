# Render Deployment Tips - Quick Reference

## ✅ Essential Configuration for Render

### 1. **NEVER Upload .env File to GitHub**

❌ **DON'T**: Commit `.env` file to git
✅ **DO**: Add environment variables in Render Dashboard

**Steps:**
1. Go to Render Dashboard
2. Select your service
3. Go to **Settings** → **Environment**
4. Click **Add Environment Variable**
5. Add each variable manually:
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=...
   etc.
   ```

### 2. **Backend Server Must Listen on process.env.PORT**

✅ **Current Configuration** (Verified Correct):
```javascript
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**Why this matters:**
- Render automatically sets `process.env.PORT`
- Render assigns a random port number
- Your app must use `process.env.PORT` (not hardcoded)
- The fallback `|| 5000` is fine for local development

### 3. **CORS Configuration**

✅ **Current Configuration**:
```javascript
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));
```

**Important:**
- Set `CORS_ORIGINS` environment variable in Render
- Use your **Netlify frontend URL** (not Render URL)
- Format: `https://your-app.netlify.app`
- No trailing slash

### 4. **MongoDB Atlas Setup**

✅ **Already Configured:**
```
MONGODB_URI=mongodb+srv://parameshk_db_user:0lXLoA8ImM0Snr8m@cluster0.yjkbg8z.mongodb.net/crm
```

**Checklist:**
- [x] MongoDB Atlas cluster created
- [x] Database user created
- [x] Network access configured (whitelist IPs)
- [x] Connection string obtained

**Network Access:**
- Allow `0.0.0.0/0` (all IPs) OR
- Add Render's IP ranges (if known)

---

## 🚀 Render Deployment Checklist

### Backend Service Setup:

- [ ] Service created in Render Dashboard
- [ ] GitHub repository connected
- [ ] Root Directory: `backend`
- [ ] Build Command: `npm install`
- [ ] Start Command: `npm start`
- [ ] Environment variables added (NOT from .env file):
  - [ ] `NODE_ENV=production`
  - [ ] `MONGODB_URI=...`
  - [ ] `JWT_SECRET=...`
  - [ ] `JWT_EXPIRE=7d`
  - [ ] `CORS_ORIGINS=https://your-netlify-app.netlify.app`
  - [ ] `RATE_LIMIT_WINDOW_MS=900000`
  - [ ] `RATE_LIMIT_MAX_REQUESTS=100`
- [ ] Service deployed successfully
- [ ] Health check endpoint working (if available)
- [ ] Backend URL copied

### After Frontend Deployment:

- [ ] Update `CORS_ORIGINS` with Netlify URL
- [ ] Redeploy backend service
- [ ] Test API connection from frontend

---

## ⚠️ Common Render Issues

### Issue 1: Service Not Starting

**Symptoms:** Build succeeds but service crashes

**Solution:**
- Check Render logs for errors
- Verify `PORT` is used (not hardcoded)
- Ensure MongoDB connection string is correct
- Check all environment variables are set

### Issue 2: 503 Error on First Request

**Symptoms:** First API call takes 30-60 seconds

**Solution:**
- ✅ This is **NORMAL** for Render free tier
- Services sleep after 15 minutes of inactivity
- First request wakes up the service (cold start)
- Consider paid tier ($7/month) for always-on service

### Issue 3: Database Connection Failed

**Symptoms:** MongoDB connection errors in logs

**Solution:**
- Check MongoDB Atlas Network Access
- Verify connection string in environment variables
- Ensure database user has correct permissions
- Test connection string locally first

### Issue 4: CORS Errors

**Symptoms:** Browser console shows CORS errors

**Solution:**
- Verify `CORS_ORIGINS` includes exact Netlify URL
- No trailing slash in URL
- Check environment variable is set correctly
- Redeploy after changing CORS_ORIGINS

---

## 📝 Quick Commands

### Check Render Logs:
1. Go to Render Dashboard
2. Select your service
3. Click **Logs** tab
4. Monitor in real-time

### Test Backend:
```bash
curl https://your-backend.onrender.com/api/dashboard/stats
```

### Verify Environment Variables:
- Go to **Settings** → **Environment**
- All variables should be listed
- No sensitive data should be in code/logs

---

## ✅ Verification Steps

After deployment:

1. **Check Build Logs:**
   - Build should complete successfully
   - No errors about missing dependencies

2. **Check Runtime Logs:**
   - Should see "Connected to MongoDB"
   - Should see "Server running on port XXXX"
   - No connection errors

3. **Test API Endpoint:**
   ```bash
   curl https://your-backend.onrender.com/api/dashboard/stats
   ```
   Should return JSON response

4. **Test from Frontend:**
   - Open browser console
   - Check Network tab
   - API calls should succeed
   - No CORS errors

---

## 💡 Pro Tips

1. **Free Tier Limitations:**
   - Services sleep after 15 min inactivity
   - First request is slow (cold start)
   - 750 hours/month included
   - Consider $7/month for always-on

2. **Environment Variables:**
   - Can be updated without redeploying
   - Changes take effect on next request
   - Always use dashboard (never .env file)

3. **Debugging:**
   - Use Render logs for server-side debugging
   - Use browser console for client-side debugging
   - Enable detailed logging in development

4. **Security:**
   - Never commit .env file
   - Rotate JWT_SECRET regularly
   - Use strong MongoDB passwords
   - Enable MongoDB Atlas encryption

---

## 🎯 Final Checklist Before Going Live

- [ ] All environment variables set in Render (not .env file)
- [ ] Backend listens on process.env.PORT
- [ ] MongoDB Atlas connection working
- [ ] CORS configured with Netlify URL
- [ ] Frontend deployed and connected
- [ ] Admin user created in database
- [ ] All features tested end-to-end
- [ ] Error handling verified
- [ ] Logs checked for warnings
- [ ] Performance acceptable

---

**Ready to deploy? Follow the main DEPLOYMENT_CHECKLIST.md for detailed steps!**
