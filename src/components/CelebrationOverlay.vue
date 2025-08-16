<script setup lang="ts">
import { useGameStore } from '../stores/game'
const store = useGameStore()
</script>

<template>
	<div v-if="store.isCelebrating" class="pointer-events-none fixed inset-0">
		<div v-for="item in store.celebrateItems" :key="item.id"
			class="absolute text-3xl will-change-transform"
			:style="{ left: item.left, top: 0, animation: `fall ${item.durationMs}ms ${item.delayMs}ms linear forwards`, transform: `rotate(${item.rotate}deg)` }"
		>{{ item.emoji }}</div>
	</div>
</template>

<style scoped>
@keyframes fall {
	0% { transform: translateY(-10%) rotate(0deg); opacity: 1; }
	100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
}
</style>


