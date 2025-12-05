<template>
    <div class="scoreboard">
        <h2>🏆 Leaderboard</h2>

        <!-- Oyuncu adı göstergesi -->
        <div class="current-player">
            <span>Playing as: <strong>{{ playerName }}</strong></span>
            <button @click="$emit('edit-name')" class="edit-btn">✏️</button>
        </div>

        <div class="difficulty-tabs">
            <button v-for="diff in difficulties" :key="diff" :class="{ active: selectedDifficulty === diff }"
                @click="selectedDifficulty = diff">
                {{ diff.charAt(0).toUpperCase() + diff.slice(1) }}
            </button>
        </div>

        <div class="leaderboard-list">
            <div v-if="filteredEntries.length === 0" class="empty">
                No records yet. Complete a game to appear here!
            </div>

            <div v-else class="entries">
                <div v-for="(entry, index) in filteredEntries" :key="entry.id" class="entry"
                    :class="{ 'top-3': index < 3 }">
                    <div class="rank">
                        {{ index + 1 }}
                        <span v-if="index === 0">🥇</span>
                        <span v-else-if="index === 1">🥈</span>
                        <span v-else="index === 2">🥉</span>
                        <div class="player">{{ entry.name }}</div>

                    </div>
                    <div class="score">{{ entry.score }}</div>
                </div>
            </div>
        </div>

        <div class="current-game" v-if="(currentScore ?? 0) > 0">
            <h3>Current Game</h3>
            <div class="current-score">Score: {{ currentScore }}</div>
            <div class="current-time">Time: {{ currentTime }}</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { GameDifficulty, LeaderboardEntry } from '@/types';

const props = defineProps<{
    entries: LeaderboardEntry[];
    currentScore?: number;
    currentTime?: string;
    playerName?: string;
}>();

const emit = defineEmits<{
    'edit-name': [];
}>();

const difficulties: GameDifficulty[] = ['beginner', 'intermediate', 'hard', 'expert'];
const selectedDifficulty = ref<GameDifficulty>('beginner');

const filteredEntries = computed(() => {
    return props.entries
        .filter(entry => entry.difficulty === selectedDifficulty.value)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
});

const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
};
</script>

<style scoped>
.scoreboard {
    background: white;
    border-radius: 10px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

h2 {
    text-align: center;
    color: #333;
    margin-bottom: 20px;
}

.current-player {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    margin-bottom: 15px;
    padding: 10px;
    background: #e9ecef;
    border-radius: 8px;
    font-size: 14px;
    color: black;
}

.current-player strong {
    color: #007bff;
}

.edit-btn {
    background: #ffc107;
    border: none;
    border-radius: 4px;
    padding: 4px 8px;
    cursor: pointer;
    font-size: 12px;
    transition: background 0.2s;
}

.edit-btn:hover {
    background: #e0a800;
}

.difficulty-tabs {
    display: flex;
    gap: 5px;
    margin-bottom: 20px;
}

.difficulty-tabs button {
    flex: 1;
    padding: 8px;
    border: 1px solid #ddd;
    background: #f8f9fa;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
}

.difficulty-tabs button.active {
    background: #007bff;
    color: white;
    border-color: #0056b3;
}

.leaderboard-list {
    min-height: 300px;
}

.empty {
    text-align: center;
    padding: 40px;
    color: #666;
    font-style: italic;
}

.entries {
    display: flex;
    flex-direction: column;
    gap: 8px;
    height: 400px;
    overflow: scroll;
}

.entry {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    background: #f8f9fa;
    border-radius: 5px;
    border-left: 4px solid #dee2e6;
}

.entry.top-3 {
    background: #fff3cd;
    border-left-color: #ffc107;
}

.entry.top-3:nth-child(1) {
    background: #fff9e6;
    border-left-color: #ffd700;
}

.rank {
    display: flex;
    gap: 7px;
    font-weight: bold;
    font-size: 18px;
    text-align: center;
    color: black;
}

.player {
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: black;
}

.score {
    font-weight: bold;
    color: #28a745;
    text-align: center;
}

.current-game {
    margin-top: 30px;
    padding-top: 20px;
    border-top: 2px solid #dee2e6;
}

.current-game h3 {
    text-align: center;
    color: #333;
    margin-bottom: 10px;
}

.current-score,
.current-time {
    text-align: center;
    font-size: 20px;
    font-weight: bold;
    color: #007bff;
}
</style>