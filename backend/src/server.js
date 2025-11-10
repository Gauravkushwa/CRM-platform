// server.js
import http from "http";
import { Server } from "socket.io";
import app, { allowedOrigins } from "./app.js";
import { initSocket } from "./utils/socket.js";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins, // use same list as Express
    credentials: true
  }
});

// Initialize your app sockets (pass io instance)
initSocket(io);

// fallback 404 for unknown routes (optional)
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
