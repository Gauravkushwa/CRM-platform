import express from "express";
import cors from "cors";
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
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const corsOptions = {
    origin: 'http://localhost:5173',    // dev frontend origin; for prod set to your deployed frontend domain
    methods: ['GET','HEAD','PUT','PATCH','POST','DELETE'],
    allowedHeaders: ['Content-Type','Authorization', 'X-Requested-With'],
    credentials: true,                  // if you use cookies/auth credentials
    optionsSuccessStatus: 204
  };
  
  app.use(cors(corsOptions));
  
  // also allow preflight requests for all routes explicitly
  app.options('*', cors(corsOptions));

app.get("/", (req, res) => res.json({ ok: true, message: "CRM backend up" }));

app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/notifications", notificationRoutes);

app.use(errorHandler);

export default app;
