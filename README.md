# 🧩 Sudoku Game

A feature-rich Sudoku game built with Vue 3, TypeScript, and Vite.

## 🚀 Features

### Core Game
- ✅ All classical Sudoku rules
- ✅ 4 difficulty levels (Beginner, Intermediate, Hard, Expert)
- ✅ Random puzzle generation
- ✅ Real-time error checking
- ✅ Non-editable pre-filled cells

### Scoring System
- ✅ +5 points per correct cell
- ✅ Hint system with increasing penalty (-3, -4, -5, ...)
- ✅ -1 point per error
- ✅ Time bonus: 500 - seconds elapsed

### UI/UX Features
- ✅ Animated 3x3 boxes and rows/columns on completion
- ✅ Available digits panel (grays out completed digits)
- ✅ Hint system (max 10 hints)
- ✅ Keyboard support
- ✅ Responsive design

### Bonus Features
- ✅ Leaderboard (top 3 per difficulty, persists on refresh)
- ✅ Undo/Redo functionality
- ✅ Draft/Notes mode
- ✅ Auto-pause on tab change
- ✅ Winning animation

## 🛠️ Installation

### Local Development
```bash
# Clone repository
git clone <repository-url>
cd sudoku-game

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build