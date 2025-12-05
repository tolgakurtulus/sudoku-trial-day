<template>
    <div class="controls">
        <div class="difficulty-selector">
            <button v-for="diff in difficulties" :key="diff" :class="{ active: difficulty === diff }"
                @click="$emit('new-game', diff)">
                {{ diff.charAt(0).toUpperCase() + diff.slice(1) }}
            </button>
        </div>

        <div class="game-controls">
            <button @click="$emit('hint')" :disabled="hintsUsed >= 10 || !startTime || isPaused">💡 Hint ({{ hintsUsed
            }}/10)</button>
            <button @click="$emit('undo')" :disabled="!startTime || isPaused">↩️ Undo</button>
            <button @click="$emit('redo')" :disabled="!startTime || isPaused">↪️ Redo</button>
            <button @click="toggleDraftMode" :disabled="!startTime || isPaused">
                {{ draftMode ? '📝 Notes Mode' : '🔢 Input Mode' }}
            </button>

            <!-- DUR/BASLAT butonu -->
            <button v-if="startTime && !isPaused" @click="$emit('pause')" class="pause-btn">
                ⏸️ Pause
            </button>
            <button v-else-if="startTime && isPaused" @click="$emit('resume')" class="resume-btn">
                ▶️ Resume
            </button>

            <!-- YENI OYUN butonu -->
            <button @click="$emit('new-game', difficulty)" class="new-game-btn">
                🆕 New Game
            </button>
        </div>

        <div class="score-display">
            <div class="score-item">
                Score: <strong>{{ score }}</strong>
                <span v-if="isPaused" class="paused-badge">PAUSED</span>
            </div>
            <div class="score-item">
                Time: <strong>{{ formattedTime }}</strong>
            </div>
            <div class="score-item">
                Hints Penalty: <strong>-{{ hintPenalty }}</strong>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import type { GameDifficulty } from '@/types';

const props = defineProps<{
    difficulty: GameDifficulty;
    score: number;
    hintsUsed: number;
    startTime: number | null;
    isPaused: boolean;
}>();

const emit = defineEmits<{
    'new-game': [difficulty: GameDifficulty];
    'hint': [];
    'undo': [];
    'redo': [];
    'toggle-draft': [];
    'pause': [];
    'resume': [];
}>();

const difficulties: GameDifficulty[] = ['beginner', 'intermediate', 'hard', 'expert'];
const draftMode = ref(false);
const elapsedSeconds = ref(0);
let timerInterval: number | null = null;

const hintPenalty = computed(() => {
    let penalty = 0;
    for (let i = 1; i <= props.hintsUsed; i++) {
        penalty += 2 + i;
    }
    return penalty;
});

const formattedTime = computed(() => {
    const seconds = elapsedSeconds.value;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
});

const startTimer = () => {
    if (timerInterval) clearInterval(timerInterval);
    if (props.startTime && !props.isPaused) {

        const now = Date.now();
        const elapsed = Math.floor((now - props.startTime) / 1000);
        elapsedSeconds.value = elapsed;

        timerInterval = setInterval(() => {
            if (!props.isPaused && props.startTime) {
                elapsedSeconds.value = Math.floor((Date.now() - props.startTime) / 1000);
            }
        }, 1000);
    }
};

const stopTimer = () => {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
};

const toggleDraftMode = () => {
    draftMode.value = !draftMode.value;
    emit('toggle-draft');
};


watch(() => props.isPaused, (isPaused) => {
    if (isPaused) {
        stopTimer();
    } else {
        startTimer();
    }
});


watch(() => props.startTime, (newStartTime) => {
    if (newStartTime) {
        elapsedSeconds.value = 0;
        startTimer();
    } else {
        stopTimer();
        elapsedSeconds.value = 0;
    }
}, { immediate: true });

onMounted(() => {
    if (props.startTime && !props.isPaused) {
        startTimer();
    }
});

onUnmounted(() => {
    stopTimer();
});
</script>

<style scoped>
.controls {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.difficulty-selector {
    display: flex;
    gap: 10px;
}

.difficulty-selector button {
    flex: 1;
    padding: 10px;
    border: 2px solid #ddd;
    background: white;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
    transition: all 0.3s;
}

.difficulty-selector button.active {
    background: #007bff;
    color: white;
    border-color: #0056b3;
}

.difficulty-selector button:hover:not(.active) {
    background: #e9ecef;
}

.game-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.game-controls button {
    flex: 1;
    min-width: 120px;
    padding: 12px;
    border: none;
    border-radius: 5px;
    color: white;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.3s;
}

.game-controls button:disabled {
    background: #ccc;
    cursor: not-allowed;
}

.game-controls button:hover:not(:disabled) {
    opacity: 0.9;
}

.game-controls button:nth-child(1) {
    background: #ffc107;
    color: #000;
}

.game-controls button:nth-child(2) {
    background: #6c757d;
}

.game-controls button:nth-child(3) {
    background: #6c757d;
}

.game-controls button:nth-child(4) {
    background: #17a2b8;
}

.pause-btn {
    background: #dc3545 !important;
}

.resume-btn {
    background: #28a745 !important;
}

.new-game-btn {
    background: #007bff !important;
}

.score-display {
    display: flex;
    justify-content: space-around;
    background: white;
    padding: 15px;
    border-radius: 5px;
    border: 2px solid #dee2e6;
    position: relative;
}

.score-item {
    text-align: center;
    color: black;
}

.score-item strong {
    display: block;
    font-size: 24px;
    color: #007bff;
}

.paused-badge {
    position: absolute;
    top: -10px;
    right: 0;
    background: #dc3545;
    color: white;
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 10px;
    font-weight: bold;
}
</style>
