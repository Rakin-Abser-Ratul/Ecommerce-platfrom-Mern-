import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './db.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import morgan from 'morgan';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

// Connect to MongoDB Atlas
connectDB();

const app = express();

// Middlewares
app.use(morgan('dev'));

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://ecommerce-platfrom-mern.vercel.app'
];

// Helper function to validate origin (supports local, main production, and Vercel preview URLs)
const isAllowedOrigin = (origin) => {
  if (!origin) return true; // Allow Postman / curl / non-browser calls
  if (allowedOrigins.includes(origin)) return true;
  if (origin.endsWith('.vercel.app')) return true; // Dynamically allows all Vercel branch previews
  return false;
};

// 1. Force explicit CORS headers on EVERY incoming request before routes execution
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (isAllowedOrigin(origin)) {
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  // Handle browser OPTIONS preflight instantly
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// 2. Additional package handling for standard route wrappers
app.use(cors({
  origin: function (origin, callback) {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/', (req, res) => {
  res.status(200).json({ status: 'success', message: 'API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/users', userRoutes);

// 3. Unmatched route catch-all (debug 404s in Vercel logs)
app.use((req, res) => {
  res.status(404).json({
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// 4. Global Error Handler Middleware
app.use((err, req, res, next) => {
  const origin = req.headers.origin;
  if (origin && isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  
  const statusCode = res.statusCode === 200 ? (err.status || 500) : res.statusCode;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// Only listen locally, not in production/Vercel
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// CRITICAL FOR VERCEL
export default app;