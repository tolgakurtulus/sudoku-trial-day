<template>
    <div class="available-digits">
        <h3>Available Digits</h3>
        <div class="digits-grid">
            <div v-for="digit in digits" :key="digit.digit" :class="[
                'digit',
                { 'complete': digit.isComplete }
            ]" @click="emit('digit-selected', digit.digit)">
                <span class="digit-number">{{ digit.digit }}</span>
                <span class="digit-count">{{ digit.count }}/9</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    digits: Array<{
        digit: number;
        count: number;
        isComplete: boolean;
    }>;
}>();

const emit = defineEmits<{
    'digit-selected': [digit: number];
}>();
</script>

<style scoped>
.available-digits {
    background: white;
    border-radius: 10px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

h3 {
    text-align: center;
    color: #333;
    margin-bottom: 10px;
}

.digits-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
}

.digit {
    aspect-ratio: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 2px solid #28a745;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
    background: #e8f5e8;
    color: #155724;

}

.digit:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border-color: #007bff;
}

.digit.complete {
    background: #f8f9fa;
    border-color: #dee2e6;
    color: rgba(128, 128, 128, 0.5);
}

.digit-number {
    font-size: 24px;
    font-weight: bold;
}

.digit-count {
    font-size: 12px;
    color: #155724;
    margin-top: 4px;
}

.digit.complete .digit-count {
    color: rgba(128, 128, 128, 0.5);
}

@media (max-width: 1280px) {
    .available-digits {
        width: 100%;
        height: 100%;
    }

    .digit {
        height: 125px;
    }
}

@media (max-width: 1024px) {
    .digits-grid {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-start;
    }

    .available-digits {
        background: transparent;
        border-radius: 10px;
        box-shadow: none;
        padding: 0;
    }


    .digit {
        width: 50px;
        height: 70px;
    }
}
</style>