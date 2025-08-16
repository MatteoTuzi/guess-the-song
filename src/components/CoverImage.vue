<script setup lang="ts">
import { useGameStore } from '../stores/game'
const store = useGameStore()
</script>

<template>
	<div v-if="store.currentSong?.cover" class="mb-4 flex justify-center">
		<img :src="store.currentSong.cover" alt="Cover" class="w-40 h-40 object-cover rounded shadow" />
	</div>
</template>


