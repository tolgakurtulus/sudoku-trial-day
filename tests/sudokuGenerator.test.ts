import { describe, it, expect } from 'vitest';
import { SudokuGenerator } from '@/utils/sudokuGenerator';

describe('SudokuGenerator', () => {
  const generator = new SudokuGenerator();

  it('should generate a 9x9 solution grid', () => {
    const solution = generator['generateSolution']();
    expect(solution.length).toBe(9);
    solution.forEach((row) => expect(row.length).toBe(9));
  });

  it('should generate a valid solved grid (no rule violations)', () => {
    const solution = generator['generateSolution']();

    for (let r = 0; r < 9; r++) {
      const row = new Set(solution[r]);
      expect(row.size).toBe(9);
    }

    for (let c = 0; c < 9; c++) {
      const col = new Set(solution.map((r) => r[c]));
      expect(col.size).toBe(9);
    }
  });

  it('should remove numbers according to difficulty ranges', () => {
    const ranges = {
      beginner: [36, 40],
      intermediate: [32, 36],
      hard: [28, 32],
      expert: [24, 28],
    };

    for (const diff of Object.keys(ranges) as any[]) {
      const puzzle = generator.generatePuzzle(diff);
      const visible = puzzle.flat().filter((cell) => cell.value !== null).length;

      const [min, max] = ranges[diff];
      expect(visible).toBeGreaterThanOrEqual(min);
      expect(visible).toBeLessThanOrEqual(max);
    }
  });

  it('should randomize shuffleNumbers()', () => {
    const nums1 = generator['shuffleNumbers']();
    const nums2 = generator['shuffleNumbers']();

    expect(nums1).not.toEqual(nums2);
  });

  it('should create puzzles with unique solutions', () => {
    const solution = generator['generateSolution']();
    const puzzle = generator['removeNumbers'](solution, 'beginner');

    const unique = generator['hasUniqueSolution'](puzzle);
    expect(unique).toBe(true);
  });
});
