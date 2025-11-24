import React, { useState, useCallback, useRef } from 'react';
import { Camera, Upload, RotateCcw, Check, ChevronRight, XCircle, AlertCircle } from 'lucide-react';
import SudokuGrid from './components/SudokuGrid';
import Loader from './components/Loader';
import { parseSudokuImage } from './services/geminiService';
import { solveSudoku } from './services/sudokuSolver';
import { AppStatus, Grid } from './types';

// Initial empty 9x9 grid
const emptyGrid: Grid = Array(9).fill(null).map(() => Array(9).fill(0));

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [grid, setGrid] = useState<Grid>(emptyGrid);
  const [initialGrid, setInitialGrid] = useState<Grid>(emptyGrid); // The snapshot before solving
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setStatus(AppStatus.PROCESSING_IMAGE);
    setError(null);

    try {
      const extractedGrid = await parseSudokuImage(file);
      setGrid(extractedGrid);
      setStatus(AppStatus.VERIFYING);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to process image");
      setStatus(AppStatus.IDLE);
    }
  };

  const handleCellChange = (row: number, col: number, val: number) => {
    const newGrid = grid.map(r => [...r]);
    newGrid[row][col] = val;
    setGrid(newGrid);
  };

  const handleSolve = useCallback(() => {
    setStatus(AppStatus.SOLVING);
    // Give UI a moment to update before blocking thread (though JS is single threaded, this helps basic render)
    setTimeout(() => {
      const solution = solveSudoku(grid);
      if (solution) {
        setInitialGrid(grid.map(row => [...row])); // Save state before solution for highlighting
        setGrid(solution);
        setStatus(AppStatus.SOLVED);
      } else {
        setError("This Sudoku puzzle seems unsolvable. Please check the numbers.");
        setStatus(AppStatus.VERIFYING);
      }
    }, 100);
  }, [grid]);

  const resetApp = () => {
    setGrid(emptyGrid);
    setInitialGrid(emptyGrid);
    setStatus(AppStatus.IDLE);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              S
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Sudoku Lens</h1>
          </div>
          {status !== AppStatus.IDLE && (
            <button 
              onClick={resetApp}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
              title="Reset"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow px-4 py-6 md:py-12 flex flex-col items-center justify-center">
        
        <div className="w-full max-w-lg space-y-6">
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium">Error</p>
                <p className="text-sm opacity-90">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-700">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* IDLE STATE */}
          {status === AppStatus.IDLE && (
            <div className="text-center space-y-8 animate-fade-in">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
                  Solve Sudokus in seconds with AI
                </h2>
                <p className="text-lg text-slate-600 max-w-md mx-auto">
                  Upload a photo of any Sudoku puzzle. We'll extract the grid and find the solution instantly.
                </p>
              </div>

              <div className="p-8 border-2 border-dashed border-slate-300 rounded-2xl bg-white hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer group" onClick={triggerFileInput}>
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Camera className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-semibold text-slate-900">Upload Image</p>
                    <p className="text-sm text-slate-500">JPG, PNG or WEBP</p>
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*" 
                  className="hidden" 
                />
              </div>

              <div className="text-sm text-slate-400">
                Powered by Gemini 2.5 Flash
              </div>
            </div>
          )}

          {/* PROCESSING STATE */}
          {status === AppStatus.PROCESSING_IMAGE && (
            <Loader message="Analyzing image for numbers..." />
          )}

          {/* SOLVING STATE */}
          {status === AppStatus.SOLVING && (
            <Loader message="Calculating solution..." />
          )}

          {/* VERIFYING STATE */}
          {status === AppStatus.VERIFYING && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="text-center space-y-1">
                <h3 className="text-lg font-semibold text-slate-900">Verify the Grid</h3>
                <p className="text-sm text-slate-500">
                  Tap any cell to correct mistakes from the image scan.
                </p>
              </div>

              <SudokuGrid 
                grid={grid} 
                onCellChange={handleCellChange} 
                initialGrid={undefined} // All cells editable in this phase essentially, but visually standard
              />

              <div className="flex justify-center pt-4">
                <button 
                  onClick={handleSolve}
                  className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg shadow-indigo-200 transition-all hover:scale-105 active:scale-95"
                >
                  <span>Solve Puzzle</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* SOLVED STATE */}
          {status === AppStatus.SOLVED && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="text-center space-y-1">
                <div className="inline-flex items-center space-x-2 text-green-600 bg-green-50 px-3 py-1 rounded-full mb-2">
                  <Check className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wide">Solved</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Here is the solution!</h3>
              </div>

              <SudokuGrid 
                grid={grid} 
                readOnly={true} 
                initialGrid={initialGrid} // Highlights the solution numbers differently
              />

              <div className="flex justify-center pt-4">
                <button 
                  onClick={resetApp}
                  className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 font-medium px-6 py-3"
                >
                  <Upload className="w-4 h-4" />
                  <span>Scan Another</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default App;