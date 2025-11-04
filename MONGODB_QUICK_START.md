# 🚀 MongoDB Authentication Quick Start

## 🎯 Fastest Way to Set Up Secure MongoDB Auth

### Option 1: Automated Setup (Recommended)

Run the automated setup script:

```bash
./quick-start-mongodb-auth.sh
```

The script will:
- ✅ Check if MongoDB is running
- ✅ Prompt you for credentials
- ✅ Create the MongoDB user
- ✅ Generate a secure JWT secret
- ✅ Create your `.env` file automatically

**That's it!** Your setup is complete.

### Option 2: Manual Setup

Follow the detailed guide: **[MONGODB_AUTH_SETUP.md](MONGODB_AUTH_SETUP.md)**

### Option 3: Use Existing Credentials

If you already have MongoDB credentials:

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your credentials:
   ```bash
   nano .env
   ```

3. Update these values:
   ```
   MONGODB_USERNAME=your_username
   MONGODB_PASSWORD=your_secure_password
   MONGODB_DATABASE=your_database
   MONGODB_URI=mongodb://username:password@host:port/database?authSource=database
   ```

## 🧪 Test Your Setup

After setup, test the connection:

```bash
# Start Docker containers
docker compose up -d

# Check logs for successful connection
docker compose logs backend | grep -i mongo

# Should see: "Connected to MongoDB"
```

## 🔒 Security Checklist

Make sure you:

- [ ] Changed default passwords
- [ ] Used strong random passwords (32+ characters)
- [ ] Generated secure JWT secret
- [ ] Created `.env` file (it's in `.gitignore`)
- [ ] Never committed credentials to git
- [ ] Enabled MongoDB authentication

## ⚡ Quick Commands

```bash
# Generate secure password
python3 -c "import secrets; print(secrets.token_urlsafe(32))"

# Generate JWT secret
python3 -c "import secrets; print(secrets.token_urlsafe(64))"

# Test MongoDB connection
mongosh "mongodb://username:password@localhost:27017/database?authSource=database"

# View Docker logs
docker compose logs -f backend

# Restart with new credentials
docker compose down
docker compose up -d
```

## 🆘 Troubleshooting

**"Authentication failed"**
- Verify username/password are correct
- Check if MongoDB auth is enabled
- Verify authSource parameter

**"Can't connect"**
- Ensure MongoDB is running: `brew services list | grep mongodb`
- Check firewall on port 27017
- Verify connection string format

**Docker can't connect**
- On Linux: Add `--add-host=host.docker.internal:host-gateway`
- Or use actual host IP instead of `host.docker.internal`

## 📖 Need More Help?

- Full guide: [MONGODB_AUTH_SETUP.md](MONGODB_AUTH_SETUP.md)
- MongoDB docs: https://docs.mongodb.com/manual/security/
- Issues? Check logs: `docker compose logs backend`

---

**Ready to go?** Run `./quick-start-mongodb-auth.sh` now! 🚀

