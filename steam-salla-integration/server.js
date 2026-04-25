require("dotenv").config();
const dns = require("node:dns");
dns.setDefaultResultOrder("ipv4first");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// NEW: Security & Logging Packages
const helmet = require("helmet");

const morgan = require("morgan");

// Route Imports
const adminRoutes = require("./routes/adminRoutes");
const sallaRoutes = require('./routes/sallaRoutes');
const { verifySallaOrder, recordAccountView } = require("./controllers/orderController");
const { generateSteamGuardCode } = require("./controllers/steamController");

// Global Handlers & Utilities
const { orderVerificationLimiter, steamGuardLimiter } = require("./utils/rateLimiters");
const globalErrorHandler = require('./middlewares/errorHandler');
const AppError = require('./utils/AppError');

// ==========================================
// 1. SAFETY NET: Uncaught Exceptions (Synchronous crashes)
// ==========================================
process.on('uncaughtException', err => {
    console.log('💥 UNCAUGHT EXCEPTION! Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});

const app = express();

// ==========================================
// 2. GLOBAL MIDDLEWARES (Security & Logging)
// ==========================================

// 1. MUST BE FIRST: Enable CORS
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));

// 2. Security Headers (Configured to not block CORS)
app.use(helmet({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
}));

// Development Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Body parser (reading data from body into req.body)
app.use(express.json({ limit: '10kb' })); // Prevents hackers from sending massive payloads
app.use('/api/salla', sallaRoutes);


// ==========================================
// 3. API ROUTES
// ==========================================
// Admin Dashboard Routes
app.use('/api/admin', adminRoutes);

// Customer Routes
app.get("/api/verify-order/:orderId", orderVerificationLimiter, verifySallaOrder);
app.get("/api/steam-guard/:orderId", steamGuardLimiter, generateSteamGuardCode);
app.post("/api/record-view/:orderId/:accountId", recordAccountView);

// 404 Route Catcher
// 404 Route Catcher
app.use((req, res, next) => {
    next(new AppError(`لا يمكن العثور على المسار: ${req.originalUrl}`, 404));
});

// The Global Error Handler
app.use(globalErrorHandler);

// ==========================================
// 4. SERVER BOOT
// ==========================================
connectDB(); // Connect to DB first

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`\n🚀 [SERVER] Application is running on http://localhost:${PORT}`);
});

// ==========================================
// 5. SAFETY NET: Unhandled Rejections (Async crashes like DB disconnects)
// ==========================================
process.on('unhandledRejection', err => {
    console.log('💥 UNHANDLED REJECTION! Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});