# CRM System

A comprehensive Customer Relationship Management system built with React, Node.js, Express, and MongoDB.

## Features

### Backend
- **Security**: JWT authentication, bcrypt password hashing, Helmet security headers, rate limiting, CORS protection
- **Models**: User, Customer, Vehicle, Service, Invoice, Reminder
- **API**: RESTful endpoints with server-side pagination, search, filtering
- **Performance**: MongoDB indexes, lean queries, efficient aggregation

### Frontend
- **Pages**: Login, Dashboard, Customers, Services, Invoices, Reminders, Users
- **Components**: TopNav, SideBar, DataTable, Search, Modal, Chart
- **Features**: React Query for data fetching, optimistic updates, code splitting
- **UX**: Skeleton loaders, toast notifications, inline editing, confirmations

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (v6+)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/crm
JWT_SECRET=your-secret-key-change-this
JWT_EXPIRE=7d
CORS_ORIGINS=http://localhost:3000
```

5. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Project Structure

```
CRM/
├── backend/
│   ├── middleware/       # Auth, error handling, rate limiting
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── server.js         # Express server setup
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── context/      # Auth context
│   │   ├── pages/        # Page components
│   │   ├── utils/        # API utilities
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Customers
- `GET /api/customers` - List customers
- `GET /api/customers/:id` - Get customer details
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Services
- `GET /api/services` - List services
- `GET /api/services/:id` - Get service details
- `POST /api/services` - Create service
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service

### Invoices
- `GET /api/invoices` - List invoices
- `GET /api/invoices/:id` - Get invoice details
- `POST /api/invoices` - Create invoice
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice

### Reminders
- `GET /api/reminders` - List reminders
- `GET /api/reminders/:id` - Get reminder details
- `POST /api/reminders` - Create reminder
- `PUT /api/reminders/:id` - Update reminder
- `DELETE /api/reminders/:id` - Delete reminder

### Users (Admin only)
- `GET /api/users` - List users
- `GET /api/users/:id` - Get user details
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Helmet**: Security headers
- **Rate Limiting**: Protect against brute force attacks
- **CORS**: Configured origins
- **Input Validation**: express-validator
- **Mongo Sanitization**: Protect against NoSQL injection
- **HTTPS Ready**: Trust proxy configuration

## Performance Features

- **Database Indexes**: Optimized queries on frequently searched fields
- **Server-side Pagination**: Default 25 items per page
- **Lean Queries**: Optimized MongoDB queries
- **Code Splitting**: React.lazy for better initial load
- **Caching**: React Query caching strategy

## User Roles

- **Admin**: Full access to all features
- **Technician**: Can manage services and invoices
- **Receptionist**: Can view and create records

## Technologies Used

### Backend
- Express.js
- MongoDB with Mongoose
- jsonwebtoken
- bcryptjs
- Helmet
- express-rate-limit
- cors
- express-validator

### Frontend
- React 18
- React Router
- React Query
- Tailwind CSS
- Recharts
- Axios
- react-hot-toast

## License

ISC

