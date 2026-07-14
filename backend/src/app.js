const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const errorHandler = require('./middleware/errorMiddleware');

const app = express();

// Security middleware - Disable CSP entirely for dev (frontend served separately)
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5500',
      'http://127.0.0.1:5500',
      'http://localhost:3000',
      'http://localhost:5000',
      process.env.FRONTEND_URL,
    ].filter(Boolean);
    
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
});
app.use('/api/auth', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// API routes
const authRoutes = require('./routes/authRoutes');
const attacheeRoutes = require('./routes/attacheeRoutes');
const supervisorRoutes = require('./routes/supervisorRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const reportRoutes = require('./routes/reportRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const userRoutes = require('./routes/userRoutes');
const departmentRoutes = require('./routes/departmentRoutes');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/attachees', attacheeRoutes());
app.use('/api/supervisors', supervisorRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Attachee Management System API is running',
    timestamp: new Date().toISOString(),
  });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../frontend', 'index.html'));
  });
}

// Error handler (must be last middleware)
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

module.exports = app;