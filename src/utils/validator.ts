export class SudokuValidator {
  private readonly SIZE = 9;
  private readonly BOX_SIZE = 3;

  validateGrid(grid: (number | null)[][]): { isValid: boolean; errors: [number, number][] } {
    const errors: [number, number][] = [];

    for (let row = 0; row < this.SIZE; row++) {
      const seen = new Set<number>();
      for (let col = 0; col < this.SIZE; col++) {
        const value = grid[row]![col]!;
        if (value !== null) {
          if (seen.has(value)) {
            for (let c = 0; c < this.SIZE; c++) {
              if (grid[row]?.[c] === value) {
                errors.push([row, c]);
              }
            }
          }
          seen.add(value);
        }
      }
    }

    for (let col = 0; col < this.SIZE; col++) {
      const seen = new Set<number>();
      for (let row = 0; row < this.SIZE; row++) {
        const value = grid[row]![col]!;
        if (value !== null) {
          if (seen.has(value)) {
            for (let r = 0; r < this.SIZE; r++) {
              if (grid[r]?.[col] === value) {
                errors.push([r, col]);
              }
            }
          }
          seen.add(value);
        }
      }
    }

    for (let boxRow = 0; boxRow < this.BOX_SIZE; boxRow++) {
      for (let boxCol = 0; boxCol < this.BOX_SIZE; boxCol++) {
        const seen = new Set<number>();
        for (let i = 0; i < this.BOX_SIZE; i++) {
          for (let j = 0; j < this.BOX_SIZE; j++) {
            const row = boxRow * this.BOX_SIZE + i;
            const col = boxCol * this.BOX_SIZE + j;
            const value = grid[row]![col]!;

            if (value !== null) {
              if (seen.has(value)) {
                for (let x = 0; x < this.BOX_SIZE; x++) {
                  for (let y = 0; y < this.BOX_SIZE; y++) {
                    const r = boxRow * this.BOX_SIZE + x;
                    const c = boxCol * this.BOX_SIZE + y;
                    if (grid[r]?.[c] === value) {
                      errors.push([r, c]);
                    }
                  }
                }
              }
              seen.add(value);
            }
          }
        }
      }
    }

    const uniqueErrors = Array.from(new Set(errors.map(([r, c]) => `${r},${c}`))).map((str) => {
      const [r, c] = str.split(',').map(Number);
      return [r, c] as [number, number];
    });

    return {
      isValid: uniqueErrors.length === 0,
      errors: uniqueErrors,
    };
  }

  isValid(grid: (number | null)[][], row: number, col: number, num: number): boolean {
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

  isComplete(grid: (number | null)[][]): boolean {
    for (let row = 0; row < this.SIZE; row++) {
      for (let col = 0; col < this.SIZE; col++) {
        if (grid[row]![col] === null) {
          return false;
        }
      }
    }

    const validation = this.validateGrid(grid);
    return validation.isValid;
  }

  getPossibleValues(grid: (number | null)[][], row: number, col: number): number[] {
    const possibleValues: number[] = [];

    for (let num = 1; num <= 9; num++) {
      if (this.isValid(grid, row, col, num)) {
        possibleValues.push(num);
      }
    }

    return possibleValues;
  }

  getSinglePossibleValue(grid: (number | null)[][], row: number, col: number): number | null {
    const possibleValues = this.getPossibleValues(grid, row, col);

    if (possibleValues.length === 1) {
      return possibleValues[0] ?? null;
    }

    return null;
  }
}
