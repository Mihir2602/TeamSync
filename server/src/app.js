require('dotenv').config({ path: './server/.env' });
const corsMiddleware = require('./middleware/corsMiddleware');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Database connection
require('./config/db')();
app.use('/api/auth', require('./routes/authRoutes'));
// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(corsMiddleware);
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per windowMs
});
app.use(limiter);


// Remove conflicting routes
// app.use('/api/auth/verify-email', require('./routes/verifyRoutes'));

// Other routes
// app.use('/api/users', require('./routes/userRoutes'));
// app.use('/api/teams', require('./routes/teamRoutes'));
// app.use('/api/updates', require('./routes/updateRoutes'));

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});