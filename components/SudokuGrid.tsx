import React from 'react';
import { Grid, CellValue } from '../types';

interface SudokuGridProps {
  grid: Grid;
  initialGrid?: Grid; // To distinguish user-entered/AI-detected vs solved cells
  onCellChange?: (row: number, col: number, val: CellValue) => void;
  readOnly?: boolean;
}

const SudokuGrid: React.FC<SudokuGridProps> = ({ grid, initialGrid, onCellChange, readOnly = false }) => {
  
  const handleChange = (row: number, col: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly || !onCellChange) return;
    
    const val = e.target.value;
    // Allow empty string or single digit 1-9
    if (val === '') {
      onCellChange(row, col, 0);
    } else if (/^[1-9]$/.test(val)) {
      onCellChange(row, col, parseInt(val, 10));
    }
  };

  return (
    <div className="select-none bg-black p-1 border-2 border-black rounded-lg shadow-xl w-full max-w-[400px] aspect-square mx-auto">
      <div className="grid grid-cols-9 gap-px bg-black h-full border-2 border-slate-900">
        {grid.map((row, rowIndex) => (
          <React.Fragment key={rowIndex}>
            {row.map((cellValue, colIndex) => {
              // Determine borders for 3x3 subgrids
              const isRightBorder = (colIndex + 1) % 3 === 0 && colIndex !== 8;
              const isBottomBorder = (rowIndex + 1) % 3 === 0 && rowIndex !== 8;
              
              const isInitialValue = initialGrid ? initialGrid[rowIndex][colIndex] !== 0 : false;
              
              // Styling logic
              let cellBg = "bg-white";
              let textColor = "text-slate-900";
              let fontWeight = "font-medium";

              if (initialGrid) {
                 // Solving mode or Result mode
                 if (isInitialValue) {
                   cellBg = "bg-slate-100";
                   textColor = "text-slate-900";
                   fontWeight = "font-bold";
                 } else {
                   // This is a filled in solution or user edit
                   textColor = "text-indigo-600";
                 }
              }

              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`
                    relative flex items-center justify-center
                    ${cellBg}
                    ${isRightBorder ? 'border-r-2 border-r-slate-800' : ''}
                    ${isBottomBorder ? 'border-b-2 border-b-slate-800' : ''}
                  `}
                >
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={cellValue === 0 ? '' : cellValue}
                    onChange={(e) => handleChange(rowIndex, colIndex, e)}
                    disabled={readOnly}
                    className={`
                      w-full h-full text-center text-xl sm:text-2xl focus:outline-none focus:bg-indigo-50
                      caret-indigo-500
                      ${textColor}
                      ${fontWeight}
                      ${readOnly ? 'cursor-default' : 'cursor-text hover:bg-slate-50'}
                    `}
                  />
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default SudokuGrid;