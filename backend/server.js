const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
require('dotenv').config();
const wa = require('@open-wa/wa-automate');

const rateLimiter = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const whatsappService = require('./services/whatsappService');

// Import routes
const authRoutes = require('./routes/auth');
const customerRoutes = require('./routes/customers');
const vehicleRoutes = require('./routes/vehicles');
const serviceRoutes = require('./routes/services');
const invoiceRoutes = require('./routes/invoices');
const reminderRoutes = require('./routes/reminders');
const estimationRoutes = require('./routes/estimations');
const userRoutes = require('./routes/users');
const dashboardRoutes = require('./routes/dashboard');
const whatsappRoutes = require('./routes/whatsapp');

const app = express();

// Trust proxy (for HTTPS in production)
app.set('trust proxy', 1);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(mongoSanitize());
app.use(morgan('dev'));

// Rate limiting
app.use('/api/', rateLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/estimations', estimationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/whatsapp', whatsappRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to 10X Motors API 🚗💨' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use(errorHandler);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crm')
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });

    // Initialize WhatsApp client when enabled
    if (String(process.env.OPEN_WA_ENABLE || 'false').toLowerCase() === 'true') {
      whatsappService.initializeWhatsApp().catch(err => {
        console.error('Failed to initialize WhatsApp:', err);
      });
    }
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

