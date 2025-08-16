<script setup lang="ts">
import { useGameStore } from '../stores/game'
const store = useGameStore()
</script>

<template>
	<div class="flex items-center justify-between mb-4">
		<div class="text-sm opacity-80">Guesses left: <span class="font-semibold">{{ store.attemptsLeft }}</span></div>
		<div class="text-sm opacity-80">Snippet length: <span class="font-semibold">{{ store.currentSnippetSeconds }}s</span></div>
	</div>
</template>


