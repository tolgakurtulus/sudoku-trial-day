import { describe, it, expect } from 'vitest';
import { SudokuValidator } from '@/utils/validator';

describe('SudokuValidator', () => {
  const validator = new SudokuValidator();

  it('should detect duplicate rows', () => {
    const grid = Array.from({ length: 9 }, (_, r) => Array.from({ length: 9 }, (_, c) => (r === 0 ? 1 : c + 1)));

    const result = validator.validateGrid(grid);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
  });

  it('should detect duplicate columns', () => {
    const grid = Array.from({ length: 9 }, (_, r) => Array.from({ length: 9 }, (_, c) => (c === 0 ? 1 : r + 1)));

    const result = validator.validateGrid(grid);
    expect(result.isValid).toBe(false);
  });

  it('should detect duplicate values in 3x3 box', () => {
    const grid = Array.from({ length: 9 }, () => Array(9).fill(null));
    grid[0][0] = 5;
    grid[1][1] = 5;

    const result = validator.validateGrid(grid);
    expect(result.isValid).toBe(false);
  });

  it('should validate a correct completed grid', () => {
    const validGrid = [
      [5, 3, 4, 6, 7, 8, 9, 1, 2],
      [6, 7, 2, 1, 9, 5, 3, 4, 8],
      [1, 9, 8, 3, 4, 2, 5, 6, 7],
      [8, 5, 9, 7, 6, 1, 4, 2, 3],
      [4, 2, 6, 8, 5, 3, 7, 9, 1],
      [7, 1, 3, 9, 2, 4, 8, 5, 6],
      [9, 6, 1, 5, 3, 7, 2, 8, 4],
      [2, 8, 7, 4, 1, 9, 6, 3, 5],
      [3, 4, 5, 2, 8, 6, 1, 7, 9],
    ];

    const result = validator.validateGrid(validGrid);
    expect(result.isValid).toBe(true);
  });

  it('should return possible values for a cell', () => {
    const grid = Array.from({ length: 9 }, () => Array(9).fill(null));
    grid[0][0] = 1;

    const values = validator.getPossibleValues(grid, 0, 1);
    expect(values).not.toContain(1);
    expect(values.length).toBe(8);
  });
});
