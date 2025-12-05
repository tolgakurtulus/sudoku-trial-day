# 🧩 Sudoku Game — Vue 3 + TypeScript

A fully-featured, performance-optimized sudoku game built using **Vue 3**, **TypeScript**, and **Vite**.
Includes puzzle generation, validator, undo/redo stack, leaderboard, hints, autosave, and much more.

---

## 🚀 Features

### 🎮 **Core Gameplay**

* ✔️ Classical Sudoku rules
* ✔️ 4 difficulty levels (Beginner → Expert)
* ✔️ Random puzzle generation
* ✔️ Real-time error validation
* ✔️ Non-editable predefined cells
* ✔️ Completion detection

### 🧠 **Scoring System**

* ✔️ +5 points per correct placement
* ✔️ Hint system with increasing penalty
* ✔️ -1 point per error
* ✔️ Time bonus = `500 - elapsedSeconds`
* ✔️ Notes (draft mode)

### 🖥️ **UI / UX**

* ✔️ Modern clean layout
* ✔️ Selected row/column/box highlighting
* ✔️ Available digits panel
* ✔️ Max 10 hints
* ✔️ Smooth animations
* ✔️ Full keyboard support
* ✔️ Fully responsive layout (desktop + mobile)

### 🔥 **Advanced Features**

* ✔️ Undo / Redo (full grid snapshots)
* ✔️ Auto-pause when switching tabs
* ✔️ Leaderboard (top 3 per difficulty)
* ✔️ Player name system
* ✔️ LocalStorage autosave
* ✔️ Winning animation

---

## 🧱 Tech Stack

| Category   | Technology              |
| ---------- | ----------------------- |
| Framework  | Vue 3 (Composition API) |
| Language   | TypeScript              |
| Build Tool | Vite                    |
| Testing    | Vitest + Vue Test Utils |
| Storage    | LocalStorage            |
| Styling    | CSS / Scoped styles     |

---

## 📁 Project Structure

```
src/
├── assets/
│   └── logo.svg
│   ├── main.css
├── components/
│   └── AvailableDigits.vue
│   ├── Controls.vue
│   ├── ScoreBoard.vue
│   ├── SudokuGrid.vue
├── composables/
│   └── useSudoku.ts
├── types/
│   └── index.ts
├── types/
│   └── index.ts
├── utils/
│   ├── sudokuGenerator.ts
│   └── validator.ts
└── App.vue
```

---

## 🧪 Tests

All core logic is unit-tested:

* Sudoku generator
* Sudoku validator
* useSudoku composable (scoring, undo/redo, hints, pause/resume, leaderboard, etc.)

Run tests:

```bash
pnpm test
```

---

## 🔧 Installation & Development

```bash
# Clone repository
git clone <repository-url>
cd sudoku-game

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build
```

---

## 📌 TODO / Future Improvements

* Dark mode
* Highlight matching numbers
* Solver / auto-complete mode
* Challenge mode (no hints)
* Animation improvements

---

## 🎉 Summary

This project demonstrates:

* Clean and modular architecture
* Use of Vue 3 Composition API
* Strong TypeScript usage
* Custom reactive state system
* Fully tested logic
* Production-ready Sudoku engine