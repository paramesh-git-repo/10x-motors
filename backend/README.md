# Backend API

This is the backend API for the CRM system.

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file in this directory:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/crm
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRE=7d
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Running

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

## API Documentation

All API endpoints are prefixed with `/api`

### Authentication Required
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Endpoints

See the main README.md for complete API documentation.

## Database

Make sure MongoDB is running on your system:

```bash
# macOS with Homebrew
brew services start mongodb-community

# Or using Docker
docker run -d -p 27017:27017 mongo

# Or using MongoDB Atlas
# Update MONGODB_URI in .env
```

## Creating First Admin User

After starting the server, you can create an admin user using MongoDB shell or the registration endpoint:

```bash
# Using curl
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin",
    "email": "admin@example.com",
    "password": "password123",
    "role": "admin"
  }'
```

Or directly in MongoDB:
```javascript
mongosh crm
```

```javascript
use crm
db.users.insertOne({
  name: "Admin",
  email: "admin@example.com",
  password: "$2a$10$R9hsX.KKZq3.7XJ8YGDk5e6a8QZ5a7BQ1XE4Y9fZ0jF0g8HYjJ",
  role: "admin",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

Note: The password hash above is for "password123" - use your own secure password.

## Health Check

```bash
curl http://localhost:5000/api/health
```

## Development Tools

- **nodemon**: Auto-reload on file changes
- **morgan**: HTTP request logger
- **express-validator**: Input validation
- **helmet**: Security headers

