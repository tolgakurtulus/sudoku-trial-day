<template>
    <div class="sudoku-grid">
        <div v-for="(row, rowIndex) in grid" :key="rowIndex" class="grid-row">
            <div v-for="(cell, colIndex) in row" :key="colIndex" :class="[
                'grid-cell',
                {
                    'given': cell.isGiven,
                    'error': cell.isError,
                    'selected': selectedCell?.row === rowIndex && selectedCell?.col === colIndex,
                    'highlight-row': highlightRow === rowIndex,
                    'highlight-col': highlightCol === colIndex,
                    'highlight-box': getBoxIndex(rowIndex, colIndex) === highlightBox,
                    'completed': isCellCompleted(rowIndex, colIndex)
                }
            ]" @click="selectCell(rowIndex, colIndex)">
                <div v-if="cell.value !== null" class="cell-value">
                    {{ cell.value }}
                </div>
                <div v-else class="cell-notes">
                    <div v-for="note in cell.notes" :key="note" class="note">
                        {{ note }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { SudokuCell } from '@/types';

const props = defineProps<{
    grid: SudokuCell[][];
    selectedCell?: { row: number; col: number } | null;
}>();

const emit = defineEmits<{
    (e: 'cell-selected', row: number, col: number): void;
}>();

const highlightRow = ref<number | null>(null);
const highlightCol = ref<number | null>(null);
const highlightBox = ref<number | null>(null);


const completedLines = ref<{
    rows: number[];
    cols: number[];
    boxes: number[];
}>({ rows: [], cols: [], boxes: [] });

const selectCell = (row: number, col: number) => {
    emit('cell-selected', row, col);
    highlightRow.value = row;
    highlightCol.value = col;
    highlightBox.value = getBoxIndex(row, col);
};

const getBoxIndex = (row: number, col: number): number => {
    return Math.floor(row / 3) * 3 + Math.floor(col / 3);
};


const isCellCompleted = (row: number, col: number): boolean => {
    return completedLines.value.rows.includes(row) ||
        completedLines.value.cols.includes(col) ||
        completedLines.value.boxes.includes(getBoxIndex(row, col));
};


watch(() => props.grid, (newGrid) => {
    checkCompletedLines(newGrid);
}, { deep: true });

const checkCompletedLines = (grid: SudokuCell[][]) => {
    const rows: number[] = [];
    const cols: number[] = [];
    const boxes: number[] = [];


    for (let r = 0; r < 9; r++) {
        const values = grid[r].map(c => c.value);
        if (isComplete(values)) rows.push(r);
    }


    for (let c = 0; c < 9; c++) {
        const values = [];
        for (let r = 0; r < 9; r++) {
            values.push(grid[r][c].value);
        }
        if (isComplete(values)) cols.push(c);
    }


    for (let box = 0; box < 9; box++) {
        const values = [];
        const startRow = Math.floor(box / 3) * 3;
        const startCol = (box % 3) * 3;

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                values.push(grid[startRow + i][startCol + j].value);
            }
        }
        if (isComplete(values)) boxes.push(box);
    }

    completedLines.value = { rows, cols, boxes };
};

const isComplete = (values: (number | null)[]): boolean => {
    const set = new Set<number>();
    for (const v of values) {
        if (v === null) return false;
        set.add(v);
    }
    return set.size === 9;
};
</script>

<style scoped>
.sudoku-grid {
    display: inline-block;
    border: 3px solid #333;
    background: #fff;
}

.grid-row {
    display: flex;
}

.grid-cell {
    width: 50px;
    height: 50px;
    border: 1px solid #ccc;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    font-weight: bold;
    cursor: pointer;
    position: relative;
    transition: background-color 0.2s;
}

.grid-cell.given {
    background-color: #f0f0f0;
    color: #000 !important;
}

.given>.cell-value {
    color: #000 !important;
}

.grid-cell.error {
    background-color: #ffcccc;
    color: #ff0000;
}



.grid-cell.highlight-row,
.grid-cell.highlight-col {
    background-color: #f0f8ff !important;
}

.grid-cell.selected {
    background-color: yellow !important;
}

.grid-cell.highlight-box {
    background-color: #f5f5f5;
}

.grid-cell:nth-child(3n) {
    border-right: 2px solid #333;
}

.grid-row:nth-child(3n) .grid-cell {
    border-bottom: 2px solid #333;
}

.grid-cell:nth-child(1) {
    border-left: 2px solid #333;
}

.grid-row:nth-child(1) .grid-cell {
    border-top: 2px solid #333;
}

.cell-notes {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 1fr);
    width: 100%;
    height: 100%;
    font-size: 12px;
}

.note {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
    font-style: italic;
}

.grid-cell.completed {
    animation: completeFlash 1s ease;
    background-color: #d4edda;
    border-color: #28a745;
}

@media (max-width: 576px) {
    .grid-cell {
        width: 35px;
    }

}

@keyframes completeFlash {
    0% {
        background-color: #fff;
    }

    50% {
        background-color: #d4edda;
        transform: scale(1.05);
    }

    100% {
        background-color: #d4edda;
    }
}



@keyframes rowFlow {
    0% {
        background-position: 200% 0;
    }

    100% {
        background-position: -200% 0;
    }
}
</style>