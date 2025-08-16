<script setup lang="ts">
import { useGameStore } from '../stores/game'
import { formatMs } from '../utils/time'
const store = useGameStore()
</script>

<template>
	<div class="mt-6">
		<div class="text-sm font-semibold mb-2">Session statistics</div>
		<div class="overflow-hidden rounded border border-slate-700">
			<table class="w-full text-sm">
				<tbody>
					<tr class="bg-slate-700/30">
						<td class="px-3 py-2">Submit count</td>
						<td class="px-3 py-2 text-right font-semibold">{{ store.stats.totalGuesses }}</td>
					</tr>
					<tr class="bg-slate-700/30">
						<td class="px-3 py-2">Hints used</td>
						<td class="px-3 py-2 text-right font-semibold">{{ store.stats.hintsUsed }}</td>
					</tr>
					<tr>
						<td class="px-3 py-2 opacity-80">Songs started</td>
						<td class="px-3 py-2 text-right">{{ store.stats.songsStarted }}</td>
					</tr>
					<tr>
						<td class="px-3 py-2 opacity-80">Songs skipped</td>
						<td class="px-3 py-2 text-right">{{ store.stats.songsSkipped }}</td>
					</tr>
					<tr>
						<td class="px-3 py-2 opacity-80">Songs completed</td>
						<td class="px-3 py-2 text-right">{{ store.stats.songsCompleted }}</td>
					</tr>
					<tr>
						<td class="px-3 py-2 opacity-80">Total guesses</td>
						<td class="px-3 py-2 text-right">{{ store.stats.totalGuesses }}</td>
					</tr>
					<tr>
						<td class="px-3 py-2 opacity-80">Correct guesses</td>
						<td class="px-3 py-2 text-right">{{ store.stats.correctGuesses }}</td>
					</tr>
					<tr>
						<td class="px-3 py-2 opacity-80">Wrong guesses</td>
						<td class="px-3 py-2 text-right">{{ store.stats.wrongGuesses }}</td>
					</tr>
					<tr>
						<td class="px-3 py-2 opacity-80">Accuracy</td>
						<td class="px-3 py-2 text-right">{{ (store.accuracy * 100).toFixed(0) }}%</td>
					</tr>
					<tr>
						<td class="px-3 py-2 opacity-80">Snippet plays</td>
						<td class="px-3 py-2 text-right">{{ store.stats.totalSnippetPlays }}</td>
					</tr>
					<tr>
						<td class="px-3 py-2 opacity-80">Time played</td>
						<td class="px-3 py-2 text-right">{{ formatMs(store.stats.totalSnippetMsPlayed) }}</td>
					</tr>
					<tr>
						<td class="px-3 py-2 opacity-80">Avg seconds when correct</td>
						<td class="px-3 py-2 text-right">{{ store.averageSnippetSecondsWhenCorrect.toFixed(1) }}s</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</template>


