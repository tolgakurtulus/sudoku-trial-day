import type { SudokuCell, GameDifficulty } from '@/types';

export class SudokuGenerator {
  private readonly SIZE = 9;
  private readonly BOX_SIZE = 3;

  generatePuzzle(difficulty: GameDifficulty): SudokuCell[][] {
    const solution = this.generateSolution();
    const puzzle = this.removeNumbers(solution, difficulty);

    return puzzle.map((row) =>
      row.map((value) => ({
        value: value,
        isGiven: value !== null,
        isError: false,
        notes: [],
        wasCorrect: false,
      }))
    );
  }

  private generateSolution(): (number | null)[][] {
    const grid = Array.from({ length: this.SIZE }, () => Array(this.SIZE).fill(null));

    this.solve(grid);
    return grid;
  }

  private solve(grid: (number | null)[][]): boolean {
    for (let row = 0; row < this.SIZE; row++) {
      for (let col = 0; col < this.SIZE; col++) {
        if (grid[row]![col] === null) {
          const numbers = this.shuffleNumbers();

          for (const num of numbers) {
            if (this.isValid(grid, row, col, num)) {
              grid[row]![col] = num;

              if (this.solve(grid)) {
                return true;
              }

              grid[row]![col] = null;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  private removeNumbers(solution: (number | null)[][], difficulty: GameDifficulty): (number | null)[][] {
    const puzzle = solution.map((row) => [...row]);
    const visibleRanges = {
      beginner: { min: 36, max: 40 },
      intermediate: { min: 32, max: 36 },
      hard: { min: 28, max: 32 },
      expert: { min: 24, max: 28 },
    };

    const range = visibleRanges[difficulty];
    const cellsToRemove = 81 - Math.floor(Math.random() * (range.max - range.min + 1) + range.min);

    let removed = 0;
    const attempts = 0;
    const maxAttempts = 200;

    while (removed < cellsToRemove && attempts < maxAttempts) {
      const row = Math.floor(Math.random() * this.SIZE);
      const col = Math.floor(Math.random() * this.SIZE);

      if (puzzle[row]?.[col] !== null) {
        const backup = puzzle[row]![col]!;
        puzzle[row]![col] = null;

        const tempPuzzle = puzzle.map((r) => [...r]);
        if (this.hasUniqueSolution(tempPuzzle)) {
          removed++;
        } else {
          puzzle[row]![col] = backup;
        }
      }
    }

    return puzzle;
  }

  private hasUniqueSolution(puzzle: (number | null)[][]): boolean {
    const solutions: (number | null)[][][] = [];
    const grid = puzzle.map((row) => [...row]);

    this.countSolutions(grid, solutions, 2);
    return solutions.length === 1;
  }

  private countSolutions(grid: (number | null)[][], solutions: (number | null)[][][], limit: number): void {
    if (solutions.length >= limit) return;

    for (let row = 0; row < this.SIZE; row++) {
      for (let col = 0; col < this.SIZE; col++) {
        if (grid[row]![col] === null) {
          for (let num = 1; num <= 9; num++) {
            if (this.isValid(grid, row, col, num)) {
              grid[row]![col] = num;
              this.countSolutions(grid, solutions, limit);
              grid[row]![col] = null;

              if (solutions.length >= limit) return;
            }
          }
          return;
        }
      }
    }

    solutions.push(grid.map((row) => [...row]));
  }

  private isValid(grid: (number | null)[][], row: number, col: number, num: number): boolean {
    for (let x = 0; x < this.SIZE; x++) {
      if (grid[row]?.[x] === num) return false;
    }

    for (let x = 0; x < this.SIZE; x++) {
      if (grid[x]?.[col] === num) return false;
    }

    const boxRow = Math.floor(row / this.BOX_SIZE) * this.BOX_SIZE;
    const boxCol = Math.floor(col / this.BOX_SIZE) * this.BOX_SIZE;

    for (let i = 0; i < this.BOX_SIZE; i++) {
      for (let j = 0; j < this.BOX_SIZE; j++) {
        if (grid[boxRow + i]?.[boxCol + j] === num) return false;
      }
    }

    return true;
  }

  private shuffleNumbers(): number[] {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j]!, numbers[i]!];
    }
    return numbers;
  }
}
