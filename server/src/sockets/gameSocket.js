const { v4: uuidv4 } = require("uuid");

const rooms = new Map();

module.exports = function(io) {
  io.on("connection", (socket) => {
    socket.on("joinRoom", ({ roomId, playerName }) => {
      let room = rooms.get(roomId);

      if (!room) {
        // Create new room
        room = {
          id: roomId || uuidv4().substring(0, 6),
          player1: { name: playerName, socketId: socket.id },
          player2: null
        };
        rooms.set(room.id, room);
        socket.join(room.id);
        socket.emit("roomCreated", { roomId: room.id, playerName });
      } else if (!room.player2) {
        // Join existing room
        room.player2 = { name: playerName, socketId: socket.id };
        socket.join(room.id);

        // Notify both players
        io.to(room.id).emit("gameStart", {
          roomId: room.id,
          player1: room.player1.name,
          player2: room.player2.name
        });

        rooms.delete(room.id); // Optionally remove room after game starts
      } else {
        socket.emit("error", "Room full or not found");
      }
    });

    socket.on("drop", ({ col }) => {
      // Handle move logic here and emit updates
      // io.to(roomId).emit("move_made", { ... });
    });

    // Add other event handlers as needed
  });
};
