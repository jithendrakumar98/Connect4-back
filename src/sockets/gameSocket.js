const { v4: uuidv4 } = require("uuid");
const Game = require("../models/gameModel");
const Player = require("../models/playerModel");
// const { sendGameEvent } = require("../kafka/producer"); // Kafka code commented out

// await sendGameEvent({
//   type: "game_completed",
//   roomId: room.id,
//   players: [room.player1.name, room.player2?.name || "BOT"],
//   winner,
//   duration: Date.now() - room.startTime,
//   timestamp: Date.now()
// });

// await sendGameEvent({
//   type: "room_created",
//   roomId: room.id,
//   player: playerName,
//   timestamp: Date.now()
// });

// await sendGameEvent({
//   type: "game_started",
//   roomId: room.id,
//   players: [room.player1.name, "BOT"],
//   timestamp: Date.now()
// });

// await sendGameEvent({
//   type: "game_started",
//   roomId: room.id,
//   players: [room.player1.name, room.player2.name],
//   timestamp: Date.now()
// });

// await sendGameEvent({
//   type: "move_made",
//   roomId: room.id,
//   player,
//   col,
//   row,
//   timestamp: Date.now()
// });

// await sendGameEvent({
//   type: "move_made",
//   roomId: room.id,
//   player: "BOT",
//   col: botCol,
//   row: botRow,
//   timestamp: Date.now()
// });

const rooms = new Map();
const disconnectedPlayers = new Map();

function dropDisc(board, col, playerValue) {
  for (let row = 5; row >= 0; row--) {
    if (board[col][row] === null) {
      board[col][row] = playerValue;
      return row;
    }
  }
  return -1;
}

function checkWinner(board) {
  const ROWS = 6;
  const COLS = 7;

  // Horizontal check
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS - 3; col++) {
      const val = board[col][row];
      if (val &&
          val === board[col + 1][row] &&
          val === board[col + 2][row] &&
          val === board[col + 3][row]) {
        return val;
      }
    }
  }

  // Vertical check
  for (let col = 0; col < COLS; col++) {
    for (let row = 0; row < ROWS - 3; row++) {
      const val = board[col][row];
      if (val &&
          val === board[col][row + 1] &&
          val === board[col][row + 2] &&
          val === board[col][row + 3]) {
        return val;
      }
    }
  }

  // Diagonal /
  for (let col = 0; col < COLS - 3; col++) {
    for (let row = 3; row < ROWS; row++) {
      const val = board[col][row];
      if (val &&
          val === board[col + 1][row - 1] &&
          val === board[col + 2][row - 2] &&
          val === board[col + 3][row - 3]) {
        return val;
      }
    }
  }

  // Diagonal \
  for (let col = 0; col < COLS - 3; col++) {
    for (let row = 0; row < ROWS - 3; row++) {
      const val = board[col][row];
      if (val &&
          val === board[col + 1][row + 1] &&
          val === board[col + 2][row + 2] &&
          val === board[col + 3][row + 3]) {
        return val;
      }
    }
  }

  // Check for draw
  let isFull = true;
  for (let col = 0; col < COLS; col++) {
    if (board[col][0] === null) {
      isFull = false;
      break;
    }
  }

  return isFull ? "draw" : null;
}

function getBotMove(board, botPlayer, opponent) {
  // Winning move
  for (let col = 0; col < 7; col++) {
    const tempBoard = board.map(column => [...column]);
    const row = dropDisc(tempBoard, col, botPlayer);
    if (row !== -1 && checkWinner(tempBoard) === botPlayer) {
      return col;
    }
  }

  // Block opponent
  for (let col = 0; col < 7; col++) {
    const tempBoard = board.map(column => [...column]);
    const row = dropDisc(tempBoard, col, opponent);
    if (row !== -1 && checkWinner(tempBoard) === opponent) {
      return col;
    }
  }

  // Prefer center columns
  const centerCols = [3, 2, 4, 1, 5, 0, 6];
  for (let col of centerCols) {
    if (board[col][0] === null) {
      return col;
    }
  }

  return 0;
}

async function saveGameAndUpdateLeaderboard(room, winner) {
  try {
    const gameDoc = new Game({
      players: [room.player1.name, room.player2?.name || "BOT"],
      board: room.board,
      winner: winner === "draw" ? null : winner,
      isCompleted: true
    });
    await gameDoc.save();

    if (winner !== "draw") {
      await Player.findOneAndUpdate(
        { username: winner },
        { $inc: { wins: 1 } },
        { upsert: true, new: true }
      );
    }

    console.log("✅ Game saved and leaderboard updated");
  } catch (err) {
    console.error("❌ Error saving game:", err);
  }
}

module.exports = function(io) {
  io.on("connection", (socket) => {
    console.log("Player connected:", socket.id);

    socket.on("joinRoom", async ({ roomId, playerName }) => {
      let room = rooms.get(roomId);

      const disconnectedPlayer = disconnectedPlayers.get(playerName);
      if (disconnectedPlayer && disconnectedPlayer.roomId === roomId) {
        clearTimeout(disconnectedPlayer.timeout);
        disconnectedPlayers.delete(playerName);

        room = rooms.get(roomId);
        if (room) {
          if (room.player1.name === playerName) room.player1.socketId = socket.id;
          else if (room.player2 && room.player2.name === playerName) room.player2.socketId = socket.id;

          socket.join(roomId);
          socket.emit("reconnected", {
            board: room.board,
            turn: room.turn,
            players: [room.player1.name, room.player2?.name || "BOT"]
          });
          io.to(roomId).emit("playerReconnected", { player: playerName });
          console.log(`✅ Player ${playerName} reconnected to room ${roomId}`);
          return;
        }
      }

      if (!room) {
        room = {
          id: roomId || uuidv4().substring(0, 6),
          player1: { name: playerName, socketId: socket.id },
          player2: null,
          board: Array(7).fill().map(() => Array(6).fill(null)),
          turn: playerName,
          waitTimer: null,
          botActive: false,
          startTime: Date.now()
        };
        rooms.set(room.id, room);
        socket.join(room.id);
        socket.emit("roomCreated", { roomId: room.id, playerName });

        room.waitTimer = setTimeout(() => {
          if (!room.player2) {
            io.to(socket.id).emit("waitingTimeout", { 
              message: "No opponent yet. Play with bot or wait 10 more seconds?" 
            });

            room.waitTimer = setTimeout(() => {
              if (!room.player2) {
                room.player2 = { name: "BOT", socketId: "bot" };
                room.botActive = true;
                
                io.to(room.id).emit("gameStart", {
                  roomId: room.id,
                  player1: room.player1.name,
                  player2: "BOT"
                });
              }
            }, 10000);
          }
        }, 10000);

      } else if (!room.player2) {
        clearTimeout(room.waitTimer);
        room.player2 = { name: playerName, socketId: socket.id };
        socket.join(room.id);

        io.to(room.id).emit("gameStart", {
          roomId: room.id,
          player1: room.player1.name,
          player2: room.player2.name
        });
      } else {
        socket.emit("error", "Room is full");
      }
    });

    socket.on("startWithBot", ({ roomId }) => {
      const room = rooms.get(roomId);
      if (!room || room.player2) return;

      clearTimeout(room.waitTimer);
      room.player2 = { name: "BOT", socketId: "bot" };
      room.botActive = true;

      io.to(room.id).emit("gameStart", {
        roomId: room.id,
        player1: room.player1.name,
        player2: "BOT"
      });
    });

    socket.on("drop", ({ col }) => {
      const room = Array.from(rooms.values()).find(r =>
        r.player1.socketId === socket.id || 
        (r.player2 && r.player2.socketId === socket.id)
      );
      if (!room) return;

      const player = room.player1.socketId === socket.id ? room.player1.name : room.player2.name;
      if (room.turn !== player) return;

      const playerValue = player === room.player1.name ? "Player1" : "Player2";
      const row = dropDisc(room.board, col, playerValue);
      if (row === -1) {
        socket.emit("error", "Column is full");
        return;
      }

      const winner = checkWinner(room.board);
      if (winner) {
        const winnerName = winner === "draw" ? "draw" : (winner === "Player1" ? room.player1.name : room.player2.name);
        io.to(room.id).emit("gameOver", { board: room.board, winner: winnerName });
        saveGameAndUpdateLeaderboard(room, winnerName);
        rooms.delete(room.id);
        return;
      }

      room.turn = player === room.player1.name ? room.player2.name : room.player1.name;

      io.to(room.id).emit("move_made", { board: room.board, turn: room.turn });

      if (room.botActive && room.turn === "BOT") {
        setTimeout(() => {
          const botCol = getBotMove(room.board, "Player2", "Player1");
          const botRow = dropDisc(room.board, botCol, "Player2");
          if (botRow === -1) return;

          const botWinner = checkWinner(room.board);
          if (botWinner) {
            const winnerName = botWinner === "draw" ? "draw" : (botWinner === "Player2" ? "BOT" : room.player1.name);
            io.to(room.id).emit("gameOver", { board: room.board, winner: winnerName });
            saveGameAndUpdateLeaderboard(room, winnerName);
            rooms.delete(room.id);
            return;
          }

          room.turn = room.player1.name;
          io.to(room.id).emit("move_made", { board: room.board, turn: room.turn });
        }, 500);
      }
    });

    socket.on("disconnect", () => {
      console.log("Player disconnected:", socket.id);
      const room = Array.from(rooms.values()).find(r =>
        r.player1.socketId === socket.id || 
        (r.player2 && r.player2.socketId === socket.id)
      );
      if (!room) return;

      const disconnectedPlayerName = room.player1.socketId === socket.id ? room.player1.name : room.player2?.name;
      if (!disconnectedPlayerName || disconnectedPlayerName === "BOT") return;

      disconnectedPlayers.set(disconnectedPlayerName, {
        roomId: room.id,
        timeout: setTimeout(() => {
          const remainingPlayer = room.player1.socketId === socket.id ? room.player2 : room.player1;
          if (remainingPlayer && remainingPlayer.socketId !== "bot") {
            io.to(remainingPlayer.socketId).emit("opponentDisconnected", { message: "Opponent disconnected. You win!" });
            saveGameAndUpdateLeaderboard(room, remainingPlayer.name);
          }
          disconnectedPlayers.delete(disconnectedPlayerName);
          rooms.delete(room.id);
          console.log(`❌ Player ${disconnectedPlayerName} forfeited (30s timeout)`);
        }, 30000)
      });

      const remainingPlayer = room.player1.socketId === socket.id ? room.player2 : room.player1;
      if (remainingPlayer && remainingPlayer.socketId !== "bot") {
        io.to(remainingPlayer.socketId).emit("opponentDisconnectedWaiting", {
          message: `${disconnectedPlayerName} disconnected. Waiting 30s for reconnection...`
        });
      }

      console.log(`⏱️ Player ${disconnectedPlayerName} has 30 seconds to reconnect`);
    });
  });
};
