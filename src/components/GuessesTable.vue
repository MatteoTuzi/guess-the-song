<script setup lang="ts">
import { useGameStore } from '../stores/game'
const store = useGameStore()
</script>

<template>
	<div class="mt-4">
		<div class="text-sm font-semibold mb-2">Guesses</div>
		<div class="overflow-hidden rounded border border-slate-700">
			<table class="w-full text-sm">
				<thead class="bg-slate-700/40">
					<tr>
						<th class="text-left px-3 py-2">#</th>
						<th class="text-left px-3 py-2">Your guess</th>
						<th class="text-left px-3 py-2">Snippet</th>
						<th class="text-left px-3 py-2">Result</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(g, i) in store.guesses" :key="i" :class="g.correct ? 'bg-emerald-900/30' : 'bg-transparent'">
						<td class="px-3 py-2">{{ i + 1 }}</td>
						<td class="px-3 py-2">{{ g.text }}</td>
						<td class="px-3 py-2">{{ g.snippet }}s</td>
						<td class="px-3 py-2">
							<span :class="g.correct ? 'text-emerald-400' : 'text-rose-400'">{{ g.correct ? 'Correct' : 'Wrong' }}</span>
						</td>
					</tr>
					<tr v-if="!store.guesses.length">
						<td colspan="4" class="px-3 py-4 text-center opacity-60">No guesses yet</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</template>


