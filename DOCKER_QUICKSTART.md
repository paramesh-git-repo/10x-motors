# Docker Quickstart for CRM with WhatsApp Integration

## 🐳 What's Included

- **Backend**: Node.js + Express + MongoDB
- **Open‑WA**: WhatsApp automation with Dockerized Chrome
- **Session persistence**: WhatsApp sessions survive container restarts

## 📦 Prerequisites

- Docker Desktop running
- MongoDB (local or remote)

## 🚀 Quick Start

### 1. Start Backend Only (No WhatsApp)

```bash
docker compose up -d
```

### 2. Enable WhatsApp Client

Stop the backend and restart with WhatsApp enabled:

```bash
docker compose down
OPEN_WA_ENABLE=true docker compose up -d
```

### 3. View Logs

```bash
docker compose logs -f backend
```

You should see QR codes for WhatsApp authentication. Scan with your phone.

## 🔧 Configuration

Edit `docker-compose.yml` to customize:

- **Ports**: Change `"5001:5000"` for backend API (mapped to 5001 to avoid macOS AirPlay conflict)
- **MongoDB**: Update `MONGODB_URI` environment variable
- **WhatsApp Session**: Change `OPEN_WA_SESSION` name

## 📝 Environment Variables

```bash
# Enable/disable WhatsApp client
OPEN_WA_ENABLE=false             # set to 'true' to enable

# MongoDB connection
MONGODB_URI=mongodb://host.docker.internal:27017/crm

# WhatsApp session name
OPEN_WA_SESSION=crm-session      # change for multiple instances

# Puppeteer/Chrome
PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
```

## 🔍 Troubleshooting

### WhatsApp QR code not appearing

Check logs:
```bash
docker compose logs backend | grep -i qr
```

### Container won't start

Check build:
```bash
docker compose build --no-cache
```

### Chrome crashes in container

Increase shared memory:
```bash
# In docker-compose.yml, already set to 1GB:
shm_size: "1g"
```

### Session data corruption

Delete volumes and start fresh:
```bash
docker compose down -v
docker compose up -d
```

## 📂 Volumes

- `wa_sessions`: WhatsApp session data (persists between restarts)
- `wa_cache`: Browser cache

## 🔐 Security Notes

- Container runs as non-root user (`appuser`)
- WhatsApp session stored in Docker volume
- Only expose ports you need (5001, 21465)

## 🔄 Rebuild After Code Changes

```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```

## 📱 Testing WhatsApp Integration

Once QR is scanned and client is ready, you can send test messages:

```javascript
// In your CRM backend code:
await client.sendText('919876543210@c.us', 'Hello from CRM!');
```

## 🆘 Need Help?

- Check logs: `docker compose logs backend`
- Inspect container: `docker compose exec backend sh`
- Stop everything: `docker compose down`

