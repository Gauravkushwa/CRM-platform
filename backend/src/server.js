import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { initSocket } from "./utils/socket.js";

const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:5173",               // dev frontend
  "http://127.0.0.1:5173",               // alternate local
  "https://zesty-dieffenbachia-82e67b.netlify.app" // replace with your deployed frontend domain
];

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // allow requests with no origin (mobile apps, curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error("CORS not allowed by Socket.IO"), false);
    },
    credentials: true
  }
});

initSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
