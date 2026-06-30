const jwt = require("jsonwebtoken");

// In-memory presence store: { roomCode: { socketId: participantData } }
const roomPresence = {};

function getParticipantList(roomCode) {
  const room = roomPresence[roomCode] || {};
  return Object.values(room);
}

function initSocket(io) {
  // Authenticate every socket connection using the JWT from the client
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("No token provided"));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded; // { id, name, email }
      next();
    } catch (err) {
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    let currentRoom = null;

    // Join a room
    socket.on("room:join", ({ roomCode, task }) => {
      currentRoom = roomCode.toUpperCase();
      socket.join(currentRoom);

      if (!roomPresence[currentRoom]) roomPresence[currentRoom] = {};

      roomPresence[currentRoom][socket.id] = {
        socketId: socket.id,
        userId: socket.user.id,
        name: socket.user.name,
        task: task || "Getting focused...",
        joinedAt: Date.now(),
      };

      io.to(currentRoom).emit("room:participants", getParticipantList(currentRoom));
      socket.to(currentRoom).emit("room:notice", {
        message: `${socket.user.name} joined the room`,
        type: "join",
      });
    });

    // Update current task
    socket.on("task:update", ({ task }) => {
      if (!currentRoom || !roomPresence[currentRoom]?.[socket.id]) return;
      roomPresence[currentRoom][socket.id].task = task;
      io.to(currentRoom).emit("room:participants", getParticipantList(currentRoom));
    });

    // Silent emoji reaction / nudge - broadcast without interrupting focus state
    socket.on("reaction:send", ({ emoji, targetUserId }) => {
      if (!currentRoom) return;
      io.to(currentRoom).emit("reaction:receive", {
        emoji,
        fromName: socket.user.name,
        fromUserId: socket.user.id,
        targetUserId: targetUserId || null,
        timestamp: Date.now(),
      });
    });

    // Participant marks session complete
    socket.on("session:complete", () => {
      if (!currentRoom) return;
      io.to(currentRoom).emit("room:notice", {
        message: `${socket.user.name} completed their focus session 🎉`,
        type: "complete",
      });
    });

    socket.on("disconnect", () => {
      if (currentRoom && roomPresence[currentRoom]?.[socket.id]) {
        const leftName = roomPresence[currentRoom][socket.id].name;
        delete roomPresence[currentRoom][socket.id];

        if (Object.keys(roomPresence[currentRoom]).length === 0) {
          delete roomPresence[currentRoom];
        } else {
          io.to(currentRoom).emit("room:participants", getParticipantList(currentRoom));
          io.to(currentRoom).emit("room:notice", {
            message: `${leftName} left the room`,
            type: "leave",
          });
        }
      }
    });
  });
}

module.exports = initSocket;
