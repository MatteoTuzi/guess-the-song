<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch, nextTick } from 'vue'
import { useGameStore } from '../stores/game'

const store = useGameStore()
const audioEl = ref<HTMLAudioElement | null>(null)

onMounted(async () => {
	store.setAudioEl(audioEl.value)
	const unlockWithGesture = async () => {
		const el = audioEl.value
		if (!el) return
		const prevVol = store.volume
		try {
			el.muted = true
			el.volume = 0
			await el.play().catch(() => {})
			el.pause()
			el.currentTime = 0
		} finally {
			el.muted = false
			el.volume = prevVol
		}
		window.removeEventListener('pointerdown', unlockWithGesture)
		window.removeEventListener('touchstart', unlockWithGesture)
		window.removeEventListener('click', unlockWithGesture)
	}
	window.addEventListener('pointerdown', unlockWithGesture, { once: true })
	window.addEventListener('touchstart', unlockWithGesture, { once: true })
	window.addEventListener('click', unlockWithGesture, { once: true })
})

onBeforeUnmount(() => {
	store.setAudioEl(null)
})

watch(
	() => store.currentSong?.url,
	async () => {
		const el = audioEl.value
		if (!el) return
		store.stopAudio()
		await nextTick()
		el.load()
		el.volume = store.volume
	}
)

watch(
	() => store.volume,
	(v) => {
		const el = audioEl.value
		if (el) el.volume = Math.max(0, Math.min(1, v))
	}
)
</script>

<template>
	<audio ref="audioEl" :src="store.currentSong?.url ?? ''" playsinline preload="auto" class="hidden"></audio>
</template>


