const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDatabase = require('./src/config/db');

// Route imports
const authRoutes = require('./src/routes/authRoutes');
const intakeRoutes = require('./src/routes/intakeRoutes');
const planRoutes = require('./src/routes/planRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const resourceRoutes = require('./src/routes/resourceRoutes');
const chatRoutes = require('./src/routes/chatRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

let allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
if (allowedOrigin && allowedOrigin.endsWith('/')) {
  allowedOrigin = allowedOrigin.slice(0, -1);
}

app.use(cors({
  origin: allowedOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS']
}));

// Request logger
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});

// Ping route
app.get('/ping', (req, res) => {
  return res.status(200).send('PONG');
});

// Root route
app.get('/', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'ClearPath India API Server is running successfully.'
  });
});

// Database connection and routing middleware
app.use(async (req, res, next) => {
  try {
    await connectDatabase();
    next();
  } catch (error) {
    console.error('Database connection failed in route dispatch:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Database connection failed. Please try again later.'
    });
  }
});

// Route registration
app.use('/api/auth', authRoutes);
app.use('/api/intake', intakeRoutes);
app.use('/api/plan', planRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/chat', chatRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error Exception:', err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

// Start server
const startServer = async () => {
  try {
    await connectDatabase();
    app.listen(PORT, () => {
      console.log(`ClearPath India Backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;
