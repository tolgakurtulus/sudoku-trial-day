import { ref, computed, reactive, watch, onMounted } from 'vue';
import { SudokuGenerator } from '@/utils/sudokuGenerator';
import { SudokuValidator } from '@/utils/validator';
import type { SudokuCell, GameDifficulty, GameState, LeaderboardEntry } from '@/types';

export function useSudoku() {
  const gameState = reactive<GameState>({
    grid: [],
    difficulty: 'beginner',
    score: 0,
    hintsUsed: 0,
    startTime: null,
    endTime: null,
    isCompleted: false,
  });

  const generator = new SudokuGenerator();
  const validator = new SudokuValidator();
  const undoStack: { grid: SudokuCell[][]; score: number }[] = [];
  const redoStack: { grid: SudokuCell[][]; score: number }[] = [];

  const LEADERBOARD_KEY = 'sudoku-leaderboard';
  const CURRENT_GAME_KEY = 'sudoku-current-game';
  const PLAYER_NAME_KEY = 'sudoku-player-name';

  const leaderboard = ref<LeaderboardEntry[]>(loadLeaderboard());
  const isPaused = ref(false);

  const playerName = ref<string>(localStorage.getItem(PLAYER_NAME_KEY) || 'Player');

  onMounted(() => {
    const savedGame = localStorage.getItem(CURRENT_GAME_KEY);
    if (savedGame) {
      try {
        const parsed = JSON.parse(savedGame);
        if (parsed.grid && parsed.difficulty) {
          Object.assign(gameState, parsed);

          if (parsed.isPaused) {
            isPaused.value = parsed.isPaused;
          }

          if (!gameState.isCompleted && gameState.startTime) {
            const elapsed = Date.now() - new Date(parsed.startTime).getTime();
            gameState.startTime = Date.now() - elapsed;
          }
        }
      } catch (e) {
        console.error('Failed to load saved game:', e);
        localStorage.removeItem(CURRENT_GAME_KEY);
      }
    }
  });

  watch(
    () => ({
      grid: gameState.grid,
      difficulty: gameState.difficulty,
      score: gameState.score,
      hintsUsed: gameState.hintsUsed,
      startTime: gameState.startTime,
      endTime: gameState.endTime,
      isCompleted: gameState.isCompleted,
      isPaused: isPaused.value,
    }),
    (newState) => {
      if (newState.grid.length > 0) {
        localStorage.setItem(CURRENT_GAME_KEY, JSON.stringify(newState));
      }
    },
    { deep: true, immediate: true }
  );

  watch(
    leaderboard,
    (newLeaderboard) => {
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(newLeaderboard));
    },
    { deep: true }
  );

  function loadLeaderboard(): LeaderboardEntry[] {
    try {
      const stored = localStorage.getItem(LEADERBOARD_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Failed to load leaderboard:', e);
      return [];
    }
  }

  const setPlayerName = (name: string) => {
    playerName.value = name.trim() || 'Player';
    localStorage.setItem(PLAYER_NAME_KEY, playerName.value);
  };

  const saveState = () => {
    undoStack.push({
      grid: JSON.parse(JSON.stringify(gameState.grid)),
      score: gameState.score,
    });
    redoStack.length = 0;
  };

  const startNewGame = (difficulty: GameDifficulty = 'beginner') => {
    gameState.difficulty = difficulty;
    gameState.grid = generator.generatePuzzle(difficulty);
    gameState.score = 0;
    gameState.hintsUsed = 0;
    gameState.startTime = Date.now();
    gameState.endTime = null;
    gameState.isCompleted = false;
    isPaused.value = false;
    undoStack.length = 0;
    redoStack.length = 0;
  };

  const setCellValue = (row: number, col: number, value: number | null) => {
    if (gameState.isCompleted || gameState.grid[row][col]?.isGiven || isPaused.value) {
      return;
    }

    const oldValue = gameState.grid[row][col].value;

    if (oldValue === value) {
      return;
    }

    saveState();

    gameState.grid[row][col].isError = false;
    gameState.grid[row][col].value = value;
    gameState.grid[row][col].notes = [];

    const gridValues = gameState.grid.map((row) => row.map((cell) => cell.value));
    const validation = validator.validateGrid(gridValues);

    validation.errors.forEach(([r, c]) => {
      gameState.grid[r][c].isError = true;
    });

    if (value !== null) {
      if (validation.errors.some(([r, c]) => r === row && c === col)) {
        gameState.score -= 1;
      } else {
        if (oldValue === null) {
          gameState.score += 5;
        }
      }
    } else {
      if (oldValue !== null) {
        const tempGrid = JSON.parse(JSON.stringify(gridValues));
        tempGrid[row][col] = null;
        const tempValidation = validator.validateGrid(tempGrid);
        const wasCorrect = !tempValidation.errors.some(([r, c]) => r === row && c === col);

        if (wasCorrect) {
          gameState.score -= 6;
        }
      }
    }

    if (validator.isComplete(gridValues)) {
      endGame();
    }
  };

  const undo = () => {
    if (undoStack.length > 0 && !isPaused.value) {
      const prevState = undoStack.pop()!;
      redoStack.push({
        grid: JSON.parse(JSON.stringify(gameState.grid)),
        score: gameState.score,
      });
      gameState.grid = prevState.grid;
      gameState.score = prevState.score;
    }
  };

  const redo = () => {
    if (redoStack.length > 0 && !isPaused.value) {
      const nextState = redoStack.pop()!;
      undoStack.push({
        grid: JSON.parse(JSON.stringify(gameState.grid)),
        score: gameState.score,
      });
      gameState.grid = nextState.grid;
      gameState.score = nextState.score;
    }
  };

  const getHint = () => {
    if (gameState.hintsUsed >= 10 || gameState.isCompleted || isPaused.value) {
      return null;
    }

    saveState();

    gameState.hintsUsed++;

    const penalty = 8 + (gameState.hintsUsed - 1);
    gameState.score -= penalty;

    const gridValues = gameState.grid.map((row) => row.map((cell) => cell.value));

    const shuffleArray = <T>(array: T[]): void => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    };

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (gridValues[row][col] === null) {
          const possibleValues = validator.getPossibleValues(gridValues, row, col);
          if (possibleValues.length === 1) {
            return { row, col, value: possibleValues[0] };
          }
        }
      }
    }

    const emptyCells: [number, number][] = [];
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (gridValues[row][col] === null) {
          emptyCells.push([row, col]);
        }
      }
    }

    if (emptyCells.length === 0) return null;

    shuffleArray(emptyCells);

    for (const [row, col] of emptyCells) {
      const possibleValues = validator.getPossibleValues(gridValues, row, col);

      if (possibleValues.length > 0) {
        return { row, col, value: possibleValues[0] };
      }
    }

    return null;
  };

  const addNote = (row: number, col: number, note: number) => {
    if (!gameState.grid[row][col].isGiven && !isPaused.value) {
      saveState();

      const notes = gameState.grid[row][col].notes;
      const index = notes.indexOf(note);

      if (index === -1) {
        notes.push(note);
      } else {
        notes.splice(index, 1);
      }
    }
  };

  const pausedTime = ref<number | null>(null);

  const pauseGame = () => {
    if (!gameState.startTime || gameState.isCompleted) return;
    isPaused.value = true;
    pausedTime.value = Date.now() - gameState.startTime;
  };

  const resumeGame = () => {
    if (pausedTime.value === null || gameState.isCompleted) return;
    isPaused.value = false;
    gameState.startTime = Date.now() - pausedTime.value;
    pausedTime.value = null;
  };

  const endGame = () => {
    gameState.endTime = Date.now();
    gameState.isCompleted = true;
    isPaused.value = false;

    if (gameState.startTime && gameState.endTime) {
      const timeElapsed = Math.floor((gameState.endTime - gameState.startTime) / 1000);
      const timeBonus = Math.max(0, 500 - timeElapsed);
      gameState.score += timeBonus;
    }

    saveToLeaderboard();

    localStorage.removeItem(CURRENT_GAME_KEY);
  };

  const saveToLeaderboard = () => {
    const entry: LeaderboardEntry = {
      id: Date.now().toString(),
      name: playerName.value,
      score: gameState.score,
      difficulty: gameState.difficulty,
      time: gameState.endTime! - gameState.startTime!,
      date: new Date().toISOString(),
    };

    const currentLeaderboard = [...leaderboard.value];
    currentLeaderboard.push(entry);
    currentLeaderboard.sort((a, b) => b.score - a.score);

    const filtered: LeaderboardEntry[] = [];
    const counts: Record<GameDifficulty, number> = {
      beginner: 0,
      intermediate: 0,
      hard: 0,
      expert: 0,
    };

    for (const entry of currentLeaderboard) {
      if (counts[entry.difficulty] < 3) {
        filtered.push(entry);
        counts[entry.difficulty]++;
      }
    }

    leaderboard.value = filtered;
  };

  const resetLeaderboard = () => {
    if (confirm('Are you sure you want to clear all leaderboard records?')) {
      leaderboard.value = [];
      localStorage.removeItem(LEADERBOARD_KEY);
    }
  };

  const resetGame = () => {
    localStorage.removeItem(CURRENT_GAME_KEY);
    startNewGame('beginner');
  };

  const hasSavedGame = computed(() => {
    return localStorage.getItem(CURRENT_GAME_KEY) !== null;
  });

  const availableDigits = computed(() => {
    if (!gameState.grid || gameState.grid.length === 0) {
      return Array.from({ length: 9 }, (_, i) => ({
        digit: i + 1,
        count: 0,
        isComplete: false,
      }));
    }

    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const value = gameState.grid[row][col]?.value;
        if (value !== null && value !== undefined) {
          counts[value]++;
        }
      }
    }

    return Object.entries(counts).map(([digit, count]) => ({
      digit: Number(digit),
      count,
      isComplete: count === 9,
    }));
  });

  return {
    gameState,
    isPaused,
    playerName,
    startNewGame,
    setCellValue,
    getHint,
    addNote,
    undo,
    redo,
    pauseGame,
    resumeGame,
    setPlayerName,
    availableDigits,
    leaderboard,
    resetLeaderboard,
    resetGame,
    hasSavedGame,
    saveToLeaderboard,
  };
}
