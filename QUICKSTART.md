# Quick Start Guide

Get the CRM system up and running in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- MongoDB running locally or Atlas connection string

## Step 1: Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/crm
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRE=7d
CORS_ORIGINS=http://localhost:3000
```

Start backend:
```bash
npm run dev
```

Backend is now running on http://localhost:5000 ✅

## Step 2: Frontend Setup

In a new terminal:
```bash
cd frontend
npm install
```

Start frontend:
```bash
npm run dev
```

Frontend is now running on http://localhost:3000 ✅

## Step 3: Create Admin User

Open http://localhost:3000 in your browser

You'll be redirected to login. Since there are no users yet, create the first admin user through MongoDB:

```bash
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

Now login with:
- Email: admin@example.com
- Password: password123

## Done! 🎉

You now have a fully functional CRM system with:
- ✅ Secure authentication
- ✅ Customer management
- ✅ Service tracking
- ✅ Invoice generation
- ✅ Reminders
- ✅ Dashboard with analytics
- ✅ Role-based access control

## Next Steps

1. Create customers via the Customers page
2. Add vehicles for customers
3. Create service jobs
4. Generate invoices
5. Set up reminders for recurring services

## Troubleshooting

**MongoDB not running?**
```bash
# macOS
brew services start mongodb-community

# Or use Docker
docker run -d -p 27017:27017 mongo
```

**Port already in use?**
Change the PORT in backend/.env or kill the process:
```bash
lsof -ti:5000 | xargs kill -9
```

**CORS errors?**
Update CORS_ORIGINS in backend/.env

## Production

See SETUP.md for production deployment instructions.

