// app.js
import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import "express-async-errors";

import authRoutes from "./routes/authRoutes.js";
import leadRoutes from "./routes/leadRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import errorHandler from "./middlewares/errorHandler.js";
import userRoutes from './routes/userRoute.js'

dotenv.config();

const app = express();

app.use(express.json());
app.use(morgan('dev'));

// === SINGLE source of truth for allowed origins (no trailing slashes) ===
export const allowedOrigins = [
  'https://zesty-dieffenbachia-82e67b.netlify.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:8080'
];

// Use official cors middleware so preflights are correct
app.use(cors({
  origin: (origin, callback) => {
    // allow tools/library requests with no origin (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('CORS policy: origin not allowed'), false);
  },
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type, Authorization, X-Requested-With, Accept'
}));

// parse cookies if you use refresh token cookie
app.use(cookieParser());

// debug logger for requests
app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.originalUrl} - Origin: ${req.headers.origin || 'no-origin'}`);
  next();
});

// Add a final response-headers logger for debugging (optional)
app.use((req, res, next) => {
  const _send = res.send;
  res.send = function (body) {
    try {
      console.log('[RESPONSE HEADERS]', req.method, req.originalUrl, JSON.stringify(res.getHeaders()));
    } catch (e) {
      console.warn('[RESPONSE HEADERS] logging failed', e);
    }
    return _send.call(this, body);
  };
  next();
});



// health
app.get("/", (req, res) => res.json({ ok: true, message: "CRM backend up" }));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes)

// error handler (last)
app.use(errorHandler);

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.stack || err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  });
  

export default app;
