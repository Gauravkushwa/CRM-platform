import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import "express-async-errors";

import authRoutes from "./routes/authRoutes.js";
import leadRoutes from "./routes/leadRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import errorHandler from "./middlewares/errorHandler.js";

dotenv.config();

const app = express();

// === Robust CORS middleware (place this BEFORE any body-parsers, static, auth, or routes) ===
// It echoes the incoming Origin for allowed origins and sets credentials header.
// It also handles preflight OPTIONS requests for all routes.
const allowedOrigins = [
    'https://zesty-dieffenbachia-82e67b.netlify.app/', // <-- replace with your real frontend domain(s)
  'http://localhost:5173',            // dev frontend origin
  'http://127.0.0.1:5173'         // alternate local origin
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log('[CORS] origin:', origin, 'method:', req.method, 'url:', req.originalUrl);

  if (!origin) {
    // non-browser requests (curl, server-to-server) — allow
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else if (allowedOrigins.includes(origin)) {
    // echo the origin back (required when credentials: true)
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin'); // helps caches/proxies
  } else {
    // origin not allowed — do not set Access-Control-Allow-Origin
    console.warn('[CORS] blocked origin:', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');

  // handle preflight
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Optional: log response headers right before sending (temporary for debugging)
app.use((req, res, next) => {
  const _send = res.send;
  res.send = function (body) {
    try {
      console.log('[RESPONSE-HEADERS-BEFORE-SEND]', req.method, req.originalUrl, res.getHeaders());
    } catch (e) {
      console.warn('[RESPONSE-HEADERS-BEFORE-SEND] failed to log', e);
    }
    return _send.call(this, body);
  };
  next();
});

// === Body parser, logger, other middlewares ===
app.use(express.json());
app.use(morgan("dev"));

// === Routes ===
app.get("/", (req, res) => res.json({ ok: true, message: "CRM backend up" }));

app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/notifications", notificationRoutes);

// error handler (keep last)
app.use(errorHandler);

export default app;
