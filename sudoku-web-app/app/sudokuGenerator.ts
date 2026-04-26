function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function isValid(board: number[], pos: number, num: number): boolean {
  const row = Math.floor(pos / 9);
  const col = pos % 9;
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;

  for (let i = 0; i < 9; i++) {
    if (board[row * 9 + i] === num) return false;
    if (board[i * 9 + col] === num) return false;
    if (board[(boxRow + Math.floor(i / 3)) * 9 + (boxCol + (i % 3))] === num) return false;
  }
  return true;
}

function fillBoard(board: number[]): boolean {
  const empty = board.indexOf(0);
  if (empty === -1) return true;

  for (const num of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
    if (isValid(board, empty, num)) {
      board[empty] = num;
      if (fillBoard(board)) return true;
      board[empty] = 0;
    }
  }
  return false;
}

export function generateSudoku(clues: number = 30): number[] {
  const solved = Array(81).fill(0);
  fillBoard(solved);

  const puzzle = [...solved];
  const positions = shuffle([...Array(81).keys()]);
  let removed = 0;

  for (const pos of positions) {
    if (removed >= 81 - clues) break;
    puzzle[pos] = 0;
    removed++;
  }

  return puzzle;
}