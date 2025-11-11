let io;


export const initSocket = (serverIO) => {
  io = serverIO;
  io.on("connection", (socket) => {
    console.log("⚡ Socket connected:", socket.id);

    socket.on("joinRoom", (room) => {
      socket.join(room);
    });

    socket.on("disconnect", () => {
      console.log("⚡ Socket disconnected:", socket.id);
    });
  });
};

export const emitToUser = (userId, event, payload) => {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
};

export const broadcast = (event, payload) => {
  if (!io) return;
  io.emit(event, payload);
};
