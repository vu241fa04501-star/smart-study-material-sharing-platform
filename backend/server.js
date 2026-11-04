const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const materialRoutes = require('./routes/materialRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Connect to Database
connectDB();

const app = express();

// CORS configuration - Allow client URL in production or all in local development
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
        return callback(null, true);
      }
      return callback(null, true); // Allow all for student project flexibility
    },
    credentials: true,
  })
);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve local uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check and API documentation root
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Smart Study Material Sharing Platform API',
    version: '1.0.0',
    documentation: {
      auth: '/api/auth (register, login, me)',
      subjects: '/api/subjects (get all, create)',
      materials: '/api/materials (upload, list, search, download, details)',
      reviews: '/api/reviews/:materialId',
      favorites: '/api/favorites',
      admin: '/api/admin (pending moderation, stats, users)',
    },
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[Smart Study Server] Running on http://localhost:${PORT}`);
  console.log(`[Environment]: ${process.env.NODE_ENV || 'development'}`);
});
