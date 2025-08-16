<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { useGameStore } from '../stores/game'
const store = useGameStore()

const progressBarEl = ref<HTMLDivElement | null>(null)
let isScrubbing = false
let wasPlayingBeforeScrub = false

function seekByEvent(e: PointerEvent) {
	const bar = progressBarEl.value
	const el = store.audioEl
	if (!bar || !el) return
	const rect = bar.getBoundingClientRect()
	const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left))
	const frac = rect.width > 0 ? x / rect.width : 0
	const targetSeconds = frac * store.currentSnippetSeconds
	store.seekTo(targetSeconds)
}

function onProgressPointerDown(e: PointerEvent) {
	const el = store.audioEl
	if (!el) return
	isScrubbing = true
	wasPlayingBeforeScrub = !el.paused
	el.pause()
	store.cancelSnippetTimers()
	seekByEvent(e)
	window.addEventListener('pointermove', onProgressPointerMove)
	window.addEventListener('pointerup', onProgressPointerUp, { once: true })
}

function onProgressPointerMove(e: PointerEvent) {
	if (!isScrubbing) return
	seekByEvent(e)
}

function onProgressPointerUp(e: PointerEvent) {
	if (!isScrubbing) return
	isScrubbing = false
	seekByEvent(e)
	window.removeEventListener('pointermove', onProgressPointerMove)
	if (wasPlayingBeforeScrub) {
		store.beginSnippetPlaybackFromCurrentTime()
	}
}

onBeforeUnmount(() => {
	window.removeEventListener('pointermove', onProgressPointerMove)
})
</script>

<template>
	<div class="flex items-center gap-2 mb-2">
		<div
			ref="progressBarEl"
			class="relative w-full h-2 bg-slate-700 rounded overflow-hidden cursor-pointer select-none"
			@pointerdown="onProgressPointerDown"
		>
			<div class="absolute inset-y-0 left-0 bg-emerald-600/40" :style="{ width: (store.currentSnippetSeconds / Math.max(...store.snippetDurationsSeconds) * 100) + '%' }"></div>
			<div class="absolute inset-y-0 left-0 bg-amber-400" :style="{ width: (Math.min(store.progressMs / (store.currentSnippetSeconds * 1000), 1) * 100) + '%' }"></div>
		</div>
		<div class="text-xs opacity-80 whitespace-nowrap">{{ Math.floor(store.progressMs / 1000) }}s / {{ store.currentSnippetSeconds }}s</div>
	</div>
</template>


