<script setup lang="ts">
import { useGameStore } from '../stores/game'
import FullAudioPlayer from './FullAudioPlayer.vue'
const store = useGameStore()

function onBackToGame() {
  store.resetGame()
}
</script>

<template>
  <div class="text-slate-100 text-center px-2 py-4 md:py-6">
    <div class="w-full max-w-2xl mx-auto">
      <div class="text-7xl mb-4">🏆</div>
      <h2 class="text-2xl font-bold mb-2">You guessed it!</h2>
      <h3 class="text-3xl md:text-4xl font-extrabold tracking-tight mb-1 bg-clip-text text-transparent bg-gradient-to-r from-rose-400 via-fuchsia-400 to-indigo-400">
        {{ store.currentSong?.title }}
      </h3>
      <p v-if="store.currentSong?.artist" class="opacity-80 mb-4 text-sm md:text-base">
        {{ store.currentSong?.artist }}
      </p>
      <div v-if="store.currentSong?.cover" class="mb-6 flex justify-center">
        <img :src="store.currentSong.cover" alt="Cover" class="w-64 h-64 md:w-72 md:h-72 object-cover rounded shadow" />
      </div>
      <div class="mb-4">
        <FullAudioPlayer :src="store.currentSong?.url ?? ''" :initialVolume="store.volume" :autoPlay="true" />
      </div>
      <button class="px-5 py-2 rounded bg-emerald-600 hover:bg-emerald-500" @click="onBackToGame">Play another</button>
    </div>
  </div>
</template>


