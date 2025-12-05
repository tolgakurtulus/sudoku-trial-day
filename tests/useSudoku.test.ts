import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSudoku } from '@/composables/useSudoku';

vi.mock('@/utils/sudokuGenerator', () => {
  return {
    SudokuGenerator: class {
      generatePuzzle() {
        return [[{ value: 1, isGiven: true, isError: false, notes: [], wasCorrect: false }, { value: null, isGiven: false, isError: false, notes: [], wasCorrect: false }, ...Array(7).fill({ value: null, isGiven: false, isError: false, notes: [], wasCorrect: false })], ...Array(8).fill(Array(9).fill({ value: null, isGiven: false, isError: false, notes: [], wasCorrect: false }))];
      }
    },
  };
});

vi.mock('@/utils/validator', () => {
  return {
    SudokuValidator: class {
      validateGrid() {
        return { isValid: true, errors: [] };
      }
      isComplete() {
        return false;
      }
      getPossibleValues() {
        return [3];
      }
    },
  };
});

describe('useSudoku composable', () => {
  let api: ReturnType<typeof useSudoku>;

  beforeEach(() => {
    localStorage.clear();
    api = useSudoku();
  });

  it('should start new game', () => {
    api.startNewGame('beginner');

    expect(api.gameState.grid.length).toBe(9);
    expect(api.gameState.startTime).not.toBe(null);
  });

  it('should set cell value and update score', () => {
    api.startNewGame('beginner');
    api.setCellValue(0, 1, 3);

    expect(api.gameState.grid[0][1].value).toBe(3);
  });

  it('undo should restore previous state', () => {
    api.startNewGame('beginner');
    api.setCellValue(0, 1, 3);
    const scoreBeforeUndo = api.gameState.score;

    api.undo();
    expect(api.gameState.score).not.toBe(scoreBeforeUndo);
  });

  it('redo should re-apply undone state', () => {
    api.startNewGame('beginner');
    api.setCellValue(0, 1, 3);
    api.undo();
    api.redo();

    expect(api.gameState.grid[0][1].value).toBe(3);
  });

  it('should generate a hint', () => {
    api.startNewGame('beginner');
    const hint = api.getHint();
    expect(hint.value).toBe(3);
  });

  it('should pause and resume game', () => {
    api.startNewGame('beginner');
    api.pauseGame();
    expect(api.isPaused.value).toBe(true);

    api.resumeGame();
    expect(api.isPaused.value).toBe(false);
  });

  it('should save leaderboard entry', () => {
    api.startNewGame();
    api.gameState.startTime = Date.now() - 10000;
    api.gameState.endTime = Date.now();
    api.gameState.isCompleted = true;

    api['saveToLeaderboard']();

    expect(api.leaderboard.value.length).toBe(1);
  });
});
