# ✅ Docker Setup Complete!

Your CRM backend is now running in Docker with WhatsApp integration support.

## 🎉 Current Status

✅ **Backend is running** at `http://localhost:5001`  
✅ **MongoDB connected** successfully  
✅ **Health check** passing  
✅ **Container** running as non-root user  

## 📍 Quick Reference

### Access Your Backend

```bash
# API is available at:
http://localhost:5001/api

# Health check:
curl http://localhost:5001/api/health

# Try it now:
curl http://localhost:5001/api/health | jq .
```

### Enable WhatsApp Integration

```bash
# Stop current container
docker compose down

# Start with WhatsApp enabled
OPEN_WA_ENABLE=true docker compose up -d

# View QR code
docker compose logs -f backend
```

### Common Commands

```bash
# View logs
docker compose logs -f backend

# Stop everything
docker compose down

# Rebuild after code changes
docker compose down
docker compose build
docker compose up -d

# Check container status
docker compose ps

# Access container shell
docker compose exec backend sh
```

## 🔧 Configuration

Your backend is configured with:
- **Port**: 5001 (mapped from container port 5000)
- **MongoDB**: `mongodb://host.docker.internal:27017/crm`
- **JWT**: Configured with default secret (change in production!)
- **WhatsApp**: Disabled by default (enable with `OPEN_WA_ENABLE=true`)

## 📝 Next Steps

1. **Update Frontend** to point to `http://localhost:5001/api`
2. **Create admin user** via registration endpoint
3. **Enable WhatsApp** when ready to test messaging
4. **Update JWT_SECRET** for production deployment

## 🚨 Important Notes

- **Port 5000** is used by macOS AirPlay - that's why we use **5001**
- **WhatsApp** requires QR code scan on first run
- **MongoDB** must be running on host machine
- **Volumes** persist session data between restarts

## 🆘 Troubleshooting

**Backend won't start?**
```bash
docker compose logs backend
```

**MongoDB connection failed?**
- Ensure MongoDB is running: `brew services list | grep mongodb`
- Or start MongoDB: `brew services start mongodb-community`
- Or use Docker MongoDB: `docker run -d -p 27017:27017 mongo`

**Port already in use?**
- Check what's on 5001: `lsof -i :5001`
- Change port in `docker-compose.yml`

**Need to start fresh?**
```bash
docker compose down -v  # Removes volumes too
docker compose up -d
```

## 🎊 Ready to Go!

Your Docker setup is complete and working. Happy coding! 🚀

