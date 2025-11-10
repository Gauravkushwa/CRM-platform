// server.js
import http from "http";
import { Server } from "socket.io";
import app, { allowedOrigins } from "./app.js";
import { initSocket } from "./utils/socket.js";

const server = http.createServer(app);

// ensure socket.io uses the same allowed origins array
const io = new Server(server, {
  cors: {
    origin: allowedOrigins, // array is accepted
    credentials: true
  }
});

initSocket(io);

// fallback 404
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
