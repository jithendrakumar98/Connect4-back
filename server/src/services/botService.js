const { dropDisc, checkWinner } = require("../utils/gameLogic");

const BOT_NAME = "BOT";

const getBotMove = (board, botName, opponent) => {
  for (let c = 0; c < 7; c++) {
    const tempBoard = board.map(row => [...row]);
    if (dropDisc(tempBoard, c, opponent)) {
      if (checkWinner(tempBoard) === opponent) return c;
    }
  }
  for (let c = 0; c < 7; c++) {
    const tempBoard = board.map(row => [...row]);
    if (dropDisc(tempBoard, c, botName)) {
      if (checkWinner(tempBoard) === botName) return c;
    }
  }
  for (let c = 0; c < 7; c++) {
    if (board[0][c] === null) return c;
  }
  return 0;
};

module.exports = { BOT_NAME, getBotMove };
