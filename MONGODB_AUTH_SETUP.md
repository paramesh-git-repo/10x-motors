# 🔐 MongoDB Authentication Setup Guide

This guide walks you through setting up secure MongoDB authentication for your CRM.

## Prerequisites

- MongoDB installed and running
- Access to MongoDB shell (`mongosh`)
- Node.js environment

## Step 1: Set Your Secure Credentials

Choose secure values for your MongoDB credentials. **Do not use the defaults in production!**

```bash
# Generate a strong random password
# macOS/Linux:
python3 -c "import secrets; print(secrets.token_urlsafe(32))"

# Or use OpenSSL:
openssl rand -base64 32
```

Recommended credentials:

```env
MONGODB_USERNAME=crmuser_admin
MONGODB_PASSWORD=<your-strong-password-here>
MONGODB_DATABASE=crm_prod
```

## Step 2: Create MongoDB User

### Option A: Using the Setup Script (Easiest)

```bash
# Navigate to backend directory
cd backend

# Run the setup script
MONGO_PASSWORD="<your-strong-password>" ./mongodb-auth-setup.sh

# Or set all variables at once:
MONGO_DATABASE="crm_prod" \
MONGO_USERNAME="crmuser_admin" \
MONGO_PASSWORD="<your-strong-password>" \
./mongodb-auth-setup.sh
```

### Option B: Manual Setup (MongoDB Shell)

If your MongoDB doesn't have authentication enabled yet:

```bash
# Connect to MongoDB
mongosh

# Switch to admin database
use admin

# Create admin user (only if first time)
db.createUser({
  user: "admin",
  pwd: "admin_secure_password",
  roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
})
```

Then create your application user:

```javascript
use crm_prod

db.createUser({
  user: "crmuser_admin",
  pwd: "<your-strong-password>",
  roles: [
    { role: "readWrite", db: "crm_prod" }
  ]
})
```

## Step 3: Enable MongoDB Authentication

Edit your MongoDB configuration file:

**macOS (Homebrew):**
```bash
# Edit config
nano /opt/homebrew/etc/mongod.conf
```

Add or update the security section:

```yaml
security:
  authorization: enabled
```

**Restart MongoDB:**
```bash
brew services restart mongodb-community
```

**Linux:**
```bash
# Edit config
sudo nano /etc/mongod.conf

# Add security section
security:
  authorization: enabled

# Restart MongoDB
sudo systemctl restart mongod
```

**Docker MongoDB:**
```bash
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=admin_password \
  -e MONGO_INITDB_DATABASE=crm_prod \
  mongo:latest
```

Then create your app user:
```bash
docker exec -it mongodb mongosh -u admin -p admin_password --authenticationDatabase admin
```

## Step 4: Create .env File

Create a `.env` file in your project root:

```bash
cd /Users/apple/Documents/CRM
cat > .env << 'EOF'
# MongoDB Credentials
MONGODB_USERNAME=crmuser_admin
MONGODB_PASSWORD=<your-actual-strong-password>
MONGODB_DATABASE=crm_prod
MONGODB_URI=mongodb://crmuser_admin:<your-actual-strong-password>@localhost:27017/crm_prod?authSource=crm_prod

# JWT Configuration
JWT_SECRET=<generate-a-random-jwt-secret>
JWT_EXPIRE=7d

# Application Settings
NODE_ENV=production
PORT=5000
CORS_ORIGINS=http://localhost:3000

# WhatsApp (optional)
OPEN_WA_ENABLE=false
OPEN_WA_SESSION=crm-session
EOF
```

**Generate JWT Secret:**
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(64))"
```

## Step 5: Update docker-compose.yml

Your `docker-compose.yml` is already configured to read from `.env` file. The environment variables will be automatically loaded.

## Step 6: Test Connection

### Test Local MongoDB Connection

```bash
# Test with MongoDB shell
mongosh "mongodb://crmuser_admin:<your-password>@localhost:27017/crm_prod?authSource=crm_prod"

# Should connect successfully
# Try some commands:
use crm_prod
db.users.countDocuments()
exit
```

### Test Backend Connection

```bash
# Start your backend
cd backend
npm run dev

# Check logs for: "Connected to MongoDB"
# If you see an error, check credentials
```

### Test Docker Connection

```bash
# Build and start containers
docker compose down
docker compose build
docker compose up -d

# Check logs
docker compose logs backend | grep -i mongo

# Should see: "Connected to MongoDB"
```

## Troubleshooting

### Authentication Failed Error

**Problem:** `Authentication failed` when connecting

**Solutions:**
1. Verify username and password are correct
2. Check if MongoDB authentication is enabled
3. Ensure user was created in the correct database
4. Verify `authSource` parameter in connection string

### Connection Refused

**Problem:** Can't connect to MongoDB

**Solutions:**
1. Check if MongoDB is running: `brew services list | grep mongodb`
2. Start MongoDB: `brew services start mongodb-community`
3. Check MongoDB logs: `tail -f /opt/homebrew/var/mongodb/mongo.log`
4. Verify firewall isn't blocking port 27017

### Permission Denied

**Problem:** User doesn't have required permissions

**Solutions:**
1. Verify user has `readWrite` role on the database
2. Check user roles: `db.getUser("crmuser_admin")`
3. Update user permissions:
   ```javascript
   use crm_prod
   db.updateUser("crmuser_admin", {
     roles: [{ role: "readWrite", db: "crm_prod" }]
   })
   ```

### Docker Can't Connect to Host MongoDB

**Problem:** `host.docker.internal` not resolving

**Solutions:**
1. **macOS/Windows:** Use `host.docker.internal` (should work by default)
2. **Linux:** Add `--add-host=host.docker.internal:host-gateway` to docker run
   ```bash
   docker compose down
   docker compose up -d --add-host=host.docker.internal:host-gateway
   ```
3. **Alternative:** Use host IP instead:
   ```bash
   # Get your host IP
   ipconfig getifaddr en0  # macOS
   
   # Update MONGODB_URI to use actual IP
   MONGODB_URI=mongodb://crmuser_admin:password@192.168.1.x:27017/crm_prod?authSource=crm_prod
   ```

## Security Checklist

- [ ] Changed default passwords
- [ ] Generated strong random passwords
- [ ] Enabled MongoDB authentication
- [ ] User has minimal required permissions (`readWrite` only)
- [ ] `.env` file is in `.gitignore`
- [ ] JWT secret is random and secure
- [ ] Using HTTPS in production
- [ ] MongoDB is not exposed to internet
- [ ] Regular backups configured
- [ ] Monitoring and logging enabled

## Production Recommendations

1. **Use MongoDB Atlas** for managed hosting with built-in security
2. **Enable TLS/SSL** for encrypted connections
3. **Use Vault or Secret Management** instead of `.env` files
4. **Implement Network Isolation** (VPN, VPC)
5. **Enable Audit Logging** for security compliance
6. **Regular Security Updates** for MongoDB
7. **Backup Strategy** with encrypted backups
8. **Access Control** - limit who can connect

## Quick Reference

**Connection String Format:**
```
mongodb://[username]:[password]@[host]:[port]/[database]?authSource=[authDb]
```

**Environment Variables:**
```bash
MONGODB_USERNAME=crmuser_admin
MONGODB_PASSWORD=<strong-password>
MONGODB_DATABASE=crm_prod
MONGODB_URI=mongodb://crmuser_admin:<password>@localhost:27017/crm_prod?authSource=crm_prod
```

**Test Connection:**
```bash
mongosh "$MONGODB_URI"
```

## Next Steps

1. ✅ Create secure credentials
2. ✅ Set up MongoDB authentication
3. ✅ Configure your application
4. 🚀 Deploy and test!
5. 🔍 Monitor and maintain security

Need help? Check the [MongoDB Documentation](https://docs.mongodb.com/manual/administration/security-checklist/)

