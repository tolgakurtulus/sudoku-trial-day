export type SudokuCell = {
  value: number | null;
  isGiven: boolean;
  isError: boolean;
  notes: number[];
  wasCorrect?: boolean;
};

export type GameDifficulty = 'beginner' | 'intermediate' | 'hard' | 'expert';

export type GameState = {
  grid: SudokuCell[][];
  difficulty: GameDifficulty;
  score: number;
  hintsUsed: number;
  startTime: number | null;
  endTime: number | null;
  isCompleted: boolean;
};

export type LeaderboardEntry = {
  id: string;
  name: string;
  score: number;
  difficulty: GameDifficulty;
  time: number;
  date: string;
};
