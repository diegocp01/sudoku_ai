export type CellValue = number | 0;
export type Grid = CellValue[][];

export enum AppStatus {
  IDLE = 'IDLE',
  PROCESSING_IMAGE = 'PROCESSING_IMAGE',
  VERIFYING = 'VERIFYING',
  SOLVING = 'SOLVING',
  SOLVED = 'SOLVED',
  ERROR = 'ERROR',
}

export interface SudokuState {
  initialGrid: Grid;
  currentGrid: Grid;
  solvedGrid: Grid | null;
  status: AppStatus;
  errorMessage: string | null;
}