import { Grid } from '../types';

function isValid(board: Grid, row: number, col: number, num: number): boolean {
  // Check row
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num) return false;
  }

  // Check col
  for (let x = 0; x < 9; x++) {
    if (board[x][col] === num) return false;
  }

  // Check 3x3 box
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[startRow + i][startCol + j] === num) return false;
    }
  }

  return true;
}

function solve(board: Grid): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        for (let num = 1; num <= 9; num++) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;

            if (solve(board)) {
              return true;
            }

            board[row][col] = 0; // Backtrack
          }
        }
        return false;
      }
    }
  }
  return true;
}

export const solveSudoku = (initialGrid: Grid): Grid | null => {
  // Deep copy to avoid mutating the input directly in case we need it later
  const boardCopy = initialGrid.map(row => [...row]);
  
  if (solve(boardCopy)) {
    return boardCopy;
  } else {
    return null;
  }
};