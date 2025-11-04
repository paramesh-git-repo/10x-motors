# Setup Guide

## Quick Start

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env file with your configuration
# At minimum, set:
# - MONGODB_URI
# - JWT_SECRET

# Start MongoDB (make sure MongoDB is running)
# Start the backend server
npm run dev
```

The backend will be running on `http://localhost:5000`

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be running on `http://localhost:3000`

### 3. Create First Admin User

After starting the backend, you can create an admin user through the API or directly in MongoDB:

```bash
# Using MongoDB shell
mongosh crm
db.users.insertOne({
  name: "Admin",
  email: "admin@example.com",
  password: "$2a$10$...", # Hashed password
  role: "admin",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

Or use the registration endpoint to create the first user.

## Database Indexes

MongoDB indexes have been defined in the models for optimal performance:

- **User**: email, role
- **Customer**: email, phone, name
- **Vehicle**: plateNumber, customer, vin
- **Service**: customer, vehicle, status, scheduledAt, technician, invoice
- **Invoice**: invoiceNumber, customer, vehicle, status, dueDate
- **Reminder**: customer, vehicle, scheduledDate, status, type

## API Testing

You can test the API using curl, Postman, or any HTTP client:

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'

# Get customers (with token)
curl http://localhost:5000/api/customers \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Production Deployment

### Backend

1. Set `NODE_ENV=production` in `.env`
2. Use a process manager like PM2:
```bash
npm install -g pm2
pm2 start server.js --name crm-backend
```

3. Configure reverse proxy (nginx)
4. Use HTTPS with Let's Encrypt
5. Set up MongoDB Atlas for production database

### Frontend

1. Build for production:
```bash
npm run build
```

2. Serve with nginx or any static file server
3. Configure API proxy to backend

## Environment Variables

### Backend (.env)

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/crm
JWT_SECRET=your-strong-secret-key
JWT_EXPIRE=7d
CORS_ORIGINS=https://yourdomain.com
```

### Frontend

The frontend is configured to proxy API calls to the backend through Vite's proxy configuration.

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check connection string in .env
- Verify network access

### CORS Errors
- Update CORS_ORIGINS in backend .env
- Include both http://localhost:3000 and production domain

### Authentication Issues
- Check JWT_SECRET is set
- Verify token expiration settings
- Clear localStorage and re-login

### Build Errors
- Delete node_modules and reinstall
- Clear npm cache: npm cache clean --force
- Update dependencies to latest versions

