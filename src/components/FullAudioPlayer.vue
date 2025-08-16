<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { formatMs } from '../utils/time'

const props = defineProps<{ src: string; initialVolume?: number; autoPlay?: boolean }>()

const audioRef = ref<HTMLAudioElement | null>(null)
const isPlaying = ref(false)
const durationMs = ref(0)
const currentMs = ref(0)
const volume = ref(typeof props.initialVolume === 'number' ? props.initialVolume : 0.8)

let rafId: number | null = null

function tick() {
  const el = audioRef.value
  if (!el) return
  currentMs.value = Math.min(el.currentTime * 1000, durationMs.value)
  if (!el.paused) rafId = requestAnimationFrame(tick)
}

function startTicking() {
  if (rafId !== null) cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(tick)
}

function stopTicking() {
  if (rafId !== null) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
}

function togglePlay() {
  const el = audioRef.value
  if (!el) return
  if (el.paused) {
    el.play().then(() => {
      isPlaying.value = true
      startTicking()
    }).catch(() => {})
  } else {
    el.pause()
    isPlaying.value = false
    stopTicking()
  }
}

function onLoadedMeta() {
  const el = audioRef.value
  if (!el) return
  durationMs.value = Math.round((el.duration || 0) * 1000)
}

function onEnded() {
  isPlaying.value = false
  stopTicking()
}

function seekToFraction(frac: number) {
  const el = audioRef.value
  if (!el || !durationMs.value) return
  const target = Math.max(0, Math.min(1, frac)) * (durationMs.value / 1000)
  el.currentTime = target
  currentMs.value = target * 1000
}

const barRef = ref<HTMLDivElement | null>(null)
let isScrubbing = false

function onBarDown(e: PointerEvent) {
  const bar = barRef.value
  if (!bar) return
  isScrubbing = true
  const rect = bar.getBoundingClientRect()
  const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left))
  seekToFraction(rect.width ? x / rect.width : 0)
  window.addEventListener('pointermove', onBarMove)
  window.addEventListener('pointerup', onBarUp, { once: true })
}

function onBarMove(e: PointerEvent) {
  if (!isScrubbing) return
  const bar = barRef.value
  if (!bar) return
  const rect = bar.getBoundingClientRect()
  const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left))
  seekToFraction(rect.width ? x / rect.width : 0)
}

function onBarUp() {
  isScrubbing = false
  window.removeEventListener('pointermove', onBarMove)
}

watch(volume, (v) => {
  const el = audioRef.value
  if (el) el.volume = Math.max(0, Math.min(1, v))
})

onMounted(() => {
  const el = audioRef.value
  if (!el) return
  el.volume = Math.max(0, Math.min(1, volume.value))
  if (props.autoPlay) {
    el.play().then(() => {
      isPlaying.value = true
      startTicking()
    }).catch(() => {})
  }
})

onBeforeUnmount(() => {
  stopTicking()
})
</script>

<template>
  <div class="w-full rounded-xl bg-slate-900/70 border border-slate-700 p-3">
    <div class="flex items-center gap-3">
      <button class="w-9 h-9 rounded-full bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center" @click="togglePlay">
        <span v-if="!isPlaying" class="i-heroicons-play-20-solid text-white"></span>
        <span v-else class="i-heroicons-pause-20-solid text-white"></span>
        <span v-if="false"></span>
      </button>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-3 text-xs opacity-80 mb-1">
          <span class="tabular-nums">{{ formatMs(currentMs) }}</span>
          <span class="opacity-60">/</span>
          <span class="tabular-nums">{{ formatMs(durationMs) }}</span>
        </div>
        <div ref="barRef" class="h-2 rounded bg-slate-700 overflow-hidden cursor-pointer" @pointerdown="onBarDown">
          <div class="h-full bg-amber-400" :style="{ width: (durationMs ? Math.min(currentMs / durationMs, 1) * 100 : 0) + '%' }"></div>
        </div>
      </div>
      <div class="flex items-center gap-2 w-32">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 opacity-80"><path d="M3 10v4a1 1 0 001 1h3l3.29 3.29A1 1 0 0012 17.59V6.41a1 1 0 00-1.71-.7L7 9H4a1 1 0 00-1 1z"/></svg>
        <input type="range" min="0" max="1" step="0.01" v-model.number="volume" class="w-full" />
      </div>
    </div>
    <audio ref="audioRef" :src="props.src" preload="auto" @loadedmetadata="onLoadedMeta" @ended="onEnded"></audio>
  </div>
</template>

<style scoped>
/* Simple icons via CSS masks to avoid extra deps */
[class^="i-heroicons-"] { display:inline-block; width:18px; height:18px; background: white; mask-size: contain; mask-repeat:no-repeat; }
.i-heroicons-play-20-solid { mask-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white"><path d="M4.5 3.76a.75.75 0 011.125-.65l10 6.24a.75.75 0 010 1.3l-10 6.24A.75.75 0 014.5 16.24V3.76z"/></svg>'); }
.i-heroicons-pause-20-solid { mask-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white"><path d="M6.25 4A1.25 1.25 0 005 5.25v9.5A1.25 1.25 0 006.25 16h.5A1.25 1.25 0 008 14.75v-9.5A1.25 1.25 0 006.75 4h-.5zM12.75 4A1.25 1.25 0 0011.5 5.25v9.5A1.25 1.25 0 0012.75 16h.5A1.25 1.25 0 0014.5 14.75v-9.5A1.25 1.25 0 0013.25 4h-.5z"/></svg>'); }
</style>


