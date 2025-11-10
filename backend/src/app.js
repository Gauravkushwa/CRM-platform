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

dotenv.config();

const app = express();

/**
 * Allowed origins (NO trailing slashes)
 * Keep this list in sync with the Socket.IO server.
 */
export const allowedOrigins = [
  'https://zesty-dieffenbachia-82e67b.netlify.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

// Use the cors middleware so preflights and headers are handled reliably
app.use(cors({
  origin: (origin, callback) => {
    // allow non-browser requests (curl/postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('CORS policy: origin not allowed'), false);
  },
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type, Authorization, X-Requested-With, Accept'
}));

// Make sure cookies are parsed (if you set cookies for auth)
app.use(cookieParser());

// Debug logging - optional but useful during development
app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.originalUrl} Origin: ${req.headers.origin || 'no-origin'}`);
  next();
});

app.use(express.json());
app.use(morgan('dev'));

// Simple health route
app.get("/", (req, res) => res.json({ ok: true, message: "CRM backend up" }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/notifications", notificationRoutes);

// error handler (keep last)
app.use(errorHandler);

export default app;
