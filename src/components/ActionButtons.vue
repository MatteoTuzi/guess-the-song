<script setup lang="ts">
import { useGameStore } from '../stores/game'
const store = useGameStore()

function onSubmit() {
	store.submitGuess()
}
function onHint() {
	store.giveHint()
}
function onPlay() {
	store.playSnippet()
}
function onChangeSong() {
	store.changeSong()
}
</script>

<template>
	<div class="flex flex-wrap items-center gap-2 mb-3">
		<button class="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50 flex items-center gap-2" @click="onSubmit" :disabled="store.hasEnded">
			<span>Submit</span>
			<span class="rounded-full bg-slate-900/60 border border-slate-600 px-2 py-0.5 text-xs">{{ store.attemptsUsed }}</span>
		</button>
		<button class="px-4 py-2 rounded bg-purple-600 hover:bg-purple-500 disabled:opacity-50 flex items-center gap-2" @click="onHint" :disabled="store.hasEnded">
			<span>Hint</span>
			<span class="rounded-full bg-slate-900/60 border border-slate-600 px-2 py-0.5 text-xs">{{ store.hintsUsed }}</span>
		</button>
		<button class="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50" @click="onPlay" :disabled="store.hasEnded">Play snippet</button>
		<button class="px-4 py-2 rounded bg-amber-600 hover:bg-amber-500" @click="onChangeSong">Change song</button>
	</div>
</template>


