const { dropDisc, checkWinner } = require("../utils/gameLogic");
const Game = require("../models/gameModel");
const Player = require("../models/playerModel");

const applyMove = async (game, player, col) => {
  if (!dropDisc(game.board, col, player)) return null;
  const winner = checkWinner(game.board);
  if (winner) {
    Object.values(game.wsMap).forEach(ws => {
      ws.send(JSON.stringify({ type: "gameOver", board: game.board, winner }));
    });
    if (winner !== "draw") {
      await Player.findOneAndUpdate(
        { username: winner },
        { $inc: { wins: 1 } },
        { upsert: true, new: true }
      );
    }
    const gameDoc = new Game({
      players: game.players,
      board: game.board,
      winner,
      isCompleted: true
    });
    await gameDoc.save();
    return winner;
  }
  game.turn = game.players.find(p => p !== player);
  Object.values(game.wsMap).forEach(ws => {
    ws.send(JSON.stringify({ type: "update", board: game.board, turn: game.turn }));
  });
  return null;
};

module.exports = { applyMove };
