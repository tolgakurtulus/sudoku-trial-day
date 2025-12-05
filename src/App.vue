<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useSudoku } from '@/composables/useSudoku';
import SudokuGrid from '@/components/SudokuGrid.vue';
import Controls from '@/components/Controls.vue';
import ScoreBoard from '@/components/ScoreBoard.vue';
import AvailableDigits from '@/components/AvailableDigits.vue';

const {
  gameState,
  isPaused,
  startNewGame: startSudokuGame,
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
  playerName,
} = useSudoku();

const selectedCell = ref<{ row: number; col: number } | null>(null);
const draftMode = ref(false);
const showHint = ref(false);
const hintData = ref<{ row: number; col: number; value: number } | null>(null);
const showLoadGameDialog = ref(false);
const showNameDialog = ref(false);
const tempPlayerName = ref('');

onMounted(() => {
  if (hasSavedGame.value && !gameState.grid.length) {
    showLoadGameDialog.value = true;
  } else if (!gameState.grid.length) {
    handleNewGame('beginner');
  }

  document.addEventListener('visibilitychange', handleVisibilityChange);

  window.addEventListener('keydown', (e) => {
    if (selectedCell.value && !gameState.isCompleted && !isPaused.value) {
      const key = e.key;
      if (key >= '1' && key <= '9') {
        handleDigitInput(parseInt(key));
      } else if (key === 'Backspace' || key === 'Delete' || key === '0') {
        handleDigitInput(null);
      } else if (key === 'h' || key === 'H') {
        handleHint();
      } else if (key === 'd' || key === 'D') {
        toggleDraftMode();
      } else if (key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (key === 'y' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleRedo();
      } else if (key === 'Z' && (e.ctrlKey || e.metaKey) && e.shiftKey) {
        e.preventDefault();
        handleRedo();
      } else if (key === 'p' || key === 'P') {
        e.preventDefault();
        if (isPaused.value) {
          handleResume();
        } else {
          handlePause();
        }
      }
    }
  });
});

watch(() => gameState.isCompleted, (isCompleted) => {
  if (isCompleted) {
    setTimeout(() => {
      tempPlayerName.value = playerName.value;
      showNameDialog.value = true;
    }, 1000);
  }
});

const formattedTime = computed(() => {
  if (!gameState.startTime) return '00:00';
  const elapsed = gameState.endTime
    ? gameState.endTime - gameState.startTime
    : Date.now() - gameState.startTime;
  const seconds = Math.floor(elapsed / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
});

const handleNewGame = (difficulty: string) => {
  startSudokuGame(difficulty as any);
  selectedCell.value = null;
  draftMode.value = false;
  showHint.value = false;
  showLoadGameDialog.value = false;
};

const loadSavedGame = () => {
  showLoadGameDialog.value = false;
};

const startFreshGame = () => {
  resetGame();
  showLoadGameDialog.value = false;
};

const handleCellSelect = (row: number, col: number) => {
  if (!isPaused.value) {
    selectedCell.value = { row, col };
  }
};

const handleDigitInput = (digit: number | null) => {
  if (selectedCell.value && !isPaused.value) {
    if (draftMode.value) {
      if (digit !== null) {
        addNote(selectedCell.value.row, selectedCell.value.col, digit);
      }
    } else {
      setCellValue(selectedCell.value.row, selectedCell.value.col, digit);
    }
  }
};

const handleHint = () => {
  const hint = getHint();
  if (hint) {
    hintData.value = hint as { row: number; col: number; value: number };
    showHint.value = true;
  }
};

const applyHint = () => {
  if (hintData.value) {
    setCellValue(hintData.value.row, hintData.value.col, hintData.value.value);
    showHint.value = false;
    hintData.value = null;
  }
};

const handleUndo = () => {
  undo();
};

const handleRedo = () => {
  redo();
};

const toggleDraftMode = () => {
  if (!isPaused.value) {
    draftMode.value = !draftMode.value;
  }
};

const handlePause = () => {
  pauseGame();
};

const handleResume = () => {
  resumeGame();
};

const handleNameSave = () => {
  if (tempPlayerName.value.trim()) {
    setPlayerName(tempPlayerName.value.trim());
    showNameDialog.value = false;
  }
};

const handleVisibilityChange = () => {
  if (document.hidden && !gameState.isCompleted) {
    handlePause();
  }
};

onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange);
});
</script>

<template>
  <div class="app">
    <header class="header">
      <div class="header-top">
        <h1>🧩 Sudoku Challenge</h1>
        <div class="player-name-display" @click="showNameDialog = true">
          👤 {{ playerName }}
          <span class="edit-icon">✏️</span>
        </div>
      </div>
    </header>

    <!-- OYUNCU ADI DIALOG -->
    <div v-if="showNameDialog" class="dialog-overlay">
      <div class="dialog">
        <h3>👤 Player Name</h3>
        <p>Enter your name for the leaderboard:</p>
        <input v-model="tempPlayerName" @keyup.enter="handleNameSave" placeholder="Enter your name" class="name-input"
          maxlength="20" autofocus />
        <div class="dialog-buttons">
          <button @click="handleNameSave" class="btn-save">
            💾 Save Name
          </button>
          <button @click="showNameDialog = false" class="btn-cancel">
            ❌ Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- KAYITLI OYUN DIALOG -->
    <div v-if="showLoadGameDialog" class="dialog-overlay">
      <div class="dialog">
        <h3>📁 Saved Game Found!</h3>
        <p>Do you want to continue your previous game or start a new one?</p>
        <div class="dialog-buttons">
          <button @click="loadSavedGame" class="btn-continue">
            🔄 Continue Saved Game
          </button>
          <button @click="startFreshGame" class="btn-new">
            🆕 Start New Game
          </button>
        </div>
      </div>
    </div>

    <main class="main-content">
      <div class="game-section">
        <Controls :difficulty="gameState.difficulty" :score="gameState.score" :hintsUsed="gameState.hintsUsed"
          :startTime="gameState.startTime" :isPaused="isPaused" @new-game="handleNewGame" @hint="handleHint"
          @undo="handleUndo" @redo="handleRedo" @toggle-draft="toggleDraftMode" @pause="handlePause"
          @resume="handleResume" />

        <div v-if="gameState.grid.length" class="game-area">
          <SudokuGrid :grid="gameState.grid" :selected-cell="selectedCell" @cell-selected="handleCellSelect" />

          <div class="side-panel">
            <AvailableDigits :digits="availableDigits" @digit-selected="handleDigitInput" />
          </div>
        </div>

        <div v-else class="no-game">
          <h3>No active game</h3>
          <button @click="handleNewGame('beginner')" class="btn-start">
            🎮 Start New Game
          </button>
        </div>
      </div>

      <div class="sidebar">
        <ScoreBoard :entries="leaderboard" :current-score="gameState.score" :current-time="formattedTime"
          :player-name="playerName" @edit-name="showNameDialog = true" />

        <div class="leaderboard-actions">
          <button @click="resetLeaderboard" class="btn-reset" v-if="leaderboard.length">
            🗑️ Clear Leaderboard
          </button>
          <p v-else class="no-records">No records yet. Complete a game!</p>
        </div>
      </div>
    </main>

    <div v-if="gameState.isCompleted" class="winning-animation">
      <div class="confetti"></div>
      <div class="win-message">
        <h2>🎉 Congratulations! 🎉</h2>
        <p>You completed the puzzle with a score of {{ gameState.score }}!</p>
        <button @click="handleNewGame(gameState.difficulty)">
          Play Again
        </button>
      </div>
    </div>

    <div v-if="showHint" class="hint-overlay" @click="showHint = false">
      <div class="hint-content">
        <p>💡 Hint: Place {{ hintData?.value }} at row {{ hintData!.row + 1 }}, column {{ hintData!.col + 1 }}</p>
        <button @click="applyHint">Apply Hint</button>
      </div>
    </div>
  </div>
</template>

<style>
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.app {
  padding: 20px;
  height: 100vh;
}

.header {
  text-align: center;
  color: white;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.header h1 {
  font-size: 3rem;
  margin-bottom: 0;
}

.player-name-display {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 8px 15px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.player-name-display:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: white;
  transform: translateY(-2px);
}

.edit-icon {
  font-size: 12px;
  opacity: 0.7;
}



.paused-indicator {
  background: #dc3545 !important;
  font-weight: bold;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    opacity: 0.7;
  }

  50% {
    opacity: 1;
  }

  100% {
    opacity: 0.7;
  }
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 30px;
}

.game-section {
  background: white;
  border-radius: 15px;
  padding: 20px 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  height: calc(100vh - 125px);
}

.game-area {
  display: flex;
  gap: 30px;
  margin-top: 30px;
  align-items: flex-start;
}

.side-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 200px;
}

.sidebar {
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.no-game {
  text-align: center;
  padding: 40px;
  color: #666;
}

.btn-start {
  background: #28a745;
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 8px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 20px;
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.dialog {
  background: white;
  padding: 30px;
  border-radius: 15px;
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.dialog h3 {
  color: #007bff;
  margin-bottom: 15px;
}

.dialog p {
  margin-bottom: 25px;
  color: #666;
}

.name-input {
  width: 100%;
  padding: 12px;
  margin: 15px 0;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  font-size: 16px;
  text-align: center;
  transition: border-color 0.3s;
}

.name-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
}

.dialog-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btn-continue {
  background: #28a745;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
}

.btn-new {
  background: #007bff;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
}

.btn-save {
  background: #28a745;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  flex: 1;
}

.btn-cancel {
  background: #6c757d;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  flex: 1;
}

.leaderboard-actions {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.btn-reset {
  background: #dc3545;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  width: 100%;
  cursor: pointer;
}

.no-records {
  text-align: center;
  color: #666;
  font-style: italic;
}

.winning-animation {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.win-message {
  background: white;
  padding: 40px;
  border-radius: 15px;
  text-align: center;
  z-index: 1001;
  animation: bounceIn 0.5s;
}

.win-message h2 {
  color: #28a745;
  margin-bottom: 20px;
}

.win-message button {
  margin-top: 20px;
  padding: 12px 30px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 18px;
  cursor: pointer;
}

.hint-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.hint-content {
  background: white;
  padding: 30px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  color: black;
}

.hint-content button {
  margin-top: 15px;
  padding: 10px 20px;
  background: #ffc107;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
}

.cell-value {
  color: black;
}

@keyframes bounceIn {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }

  50% {
    transform: scale(1.05);
    opacity: 1;
  }

  100% {
    transform: scale(1);
  }
}

.confetti {
  position: absolute;
  width: 10px;
  height: 10px;
  background: #ff0000;
  animation: confetti-fall 1s linear infinite;
}

@keyframes confetti-fall {
  0% {
    transform: translateY(-100vh) rotate(0deg);
    opacity: 1;
  }

  100% {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0;
  }
}

@media (max-width: 1280px) {
  .app {
    height: 100%;
  }

  .main-content {
    grid-template-columns: 1fr;
  }

  .game-section {
    height: 100%;

  }

  .side-panel {
    width: 455px;
    height: 455px;
  }
}

@media (max-width: 1024px) {
  .side-panel {
    width: 100%;
    height: 100%;
    min-width: auto;
  }
}

@media (max-width: 768px) {
  .header-top {
    flex-direction: column;
    gap: 10px;
  }

  .header h1 {
    font-size: 2rem;
  }

  .game-section {
    padding: 15px;
  }

  .game-area {
    display: flex;
    align-items: center;
    flex-direction: column;
  }

  .digits-grid {
    justify-content: center !important;
  }
}
</style>