const checkWinner = (board) => {
  const rows = 6;
  const cols = 7;
  const directions = [
    [0, 1], [1, 0], [1, 1], [1, -1]
  ];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const player = board[r][c];
      if (!player) continue;

      for (let [dr, dc] of directions) {
        let count = 0;
        for (let k = 0; k < 4; k++) {
          const nr = r + dr * k;
          const nc = c + dc * k;
          if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) break;
          if (board[nr][nc] === player) count++;
        }
        if (count === 4) return player;
      }
    }
  }

  const isDraw = board.every(row => row.every(cell => cell !== null));
  return isDraw ? "draw" : null;
};

const dropDisc = (board, col, player) => {
  for (let r = board.length - 1; r >= 0; r--) {
    if (!board[r][col]) {
      board[r][col] = player;
      return true;
    }
  }
  return false;
};

module.exports = { checkWinner, dropDisc };
