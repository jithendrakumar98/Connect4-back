const { v4: uuidv4 } = require("uuid");
const { BOT_NAME, getBotMove } = require("./botService");

const activeGames = {};
const waitingPlayers = [];

const addPlayerToQueue = (username, ws) => {
  waitingPlayers.push({ username, ws, joinTime: Date.now() });
  ws.send(JSON.stringify({ type: "waiting", message: "Waiting for opponent..." }));

  setTimeout(() => {
    const index = waitingPlayers.findIndex(p => p.ws === ws);
    if (index === -1) return;
    if (waitingPlayers.length === 1) {
      const gameId = uuidv4();
      const board = Array(6).fill().map(() => Array(7).fill(null));
      const botWs = { username: BOT_NAME, send: () => {} };
      activeGames[gameId] = {
        players: [username, BOT_NAME],
        board,
        turn: username,
        wsMap: { [username]: ws, [BOT_NAME]: botWs }
      };
      ws.send(JSON.stringify({
        type: "start",
        gameId,
        board,
        players: [username, BOT_NAME],
        turn: username
      }));
      waitingPlayers.splice(index, 1);
    }
  }, 10000);
};

const matchPlayers = () => {
  while (waitingPlayers.length >= 2) {
    const p1 = waitingPlayers.shift();
    const p2 = waitingPlayers.shift();
    const gameId = uuidv4();
    const board = Array(6).fill().map(() => Array(7).fill(null));
    activeGames[gameId] = {
      players: [p1.username, p2.username],
      board,
      turn: p1.username,
      wsMap: { [p1.username]: p1.ws, [p2.username]: p2.ws }
    };
    [p1.ws, p2.ws].forEach(ws => {
      ws.send(JSON.stringify({
        type: "start",
        gameId,
        board,
        players: [p1.username, p2.username],
        turn: p1.username
      }));
    });
  }
};

module.exports = { addPlayerToQueue, matchPlayers, activeGames };
