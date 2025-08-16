<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useGameStore } from '../stores/game'
import TopInfo from './TopInfo.vue'
import ArtistSelector from './ArtistSelector.vue'
import CoverImage from './CoverImage.vue'
import SnippetProgressBar from './SnippetProgressBar.vue'
import GuessInput from './GuessInput.vue'
import ActionButtons from './ActionButtons.vue'
import GuessesTable from './GuessesTable.vue'
import SessionStats from './SessionStats.vue'
import CelebrationOverlay from './CelebrationOverlay.vue'
import AudioPlayer from './AudioPlayer.vue'

const store = useGameStore()

onMounted(() => {
	const pages = /panic/i.test(store.selectedArtist) ? 12 : 8
	store.loadArtistMp3Songs(store.selectedArtist, pages)
})

watch(
	() => store.selectedArtist,
	(val) => {
		const pages = /panic/i.test(val) ? 12 : 8
		store.loadArtistMp3Songs(val, pages)
	}
)
</script>

<template>
	<div class="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
		<div class="w-full max-w-xl">
			<h1 class="text-3xl font-bold mb-6 text-center">Guess The Song</h1>
			<div class="bg-slate-800 rounded-lg p-6 shadow">
				<TopInfo />
				<div v-if="!store.currentSong" class="text-sm mb-3">No playable tracks for your browser. Try another browser.</div>
				<AudioPlayer />
				<ArtistSelector />
				<CoverImage />
				<SnippetProgressBar />
				<GuessInput />
				<ActionButtons />
				<CelebrationOverlay />
				<GuessesTable />
				<SessionStats />
				<p class="min-h-6 text-sm opacity-90">{{ store.feedback }}</p>
			</div>
			<p class="mt-4 text-xs text-center opacity-70">Tracks from Wikimedia Commons (public domain/CC). For demo only.</p>
		</div>
	</div>
</template>

<style scoped>
@keyframes fall {
	0% { transform: translateY(-10%) rotate(0deg); opacity: 1; }
	100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
}
</style>


