<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import TomSelect from 'tom-select'
import 'tom-select/dist/css/tom-select.css'
import { useGameStore } from '../stores/game'
const store = useGameStore()
const emit = defineEmits<{ (e: 'artist-changed', value: string): void }>()

const volumePercent = computed({
	get: () => Math.round(store.volume * 100),
	set: (p: number) => store.setVolume(p / 100),
})

const artistInput = ref<HTMLInputElement | null>(null)
let tom: any = null

onMounted(() => {
	if (!artistInput.value) return
	tom = new TomSelect(artistInput.value, {
		options: [
			{ value: 'Lady Gaga', text: 'Lady Gaga' },
			{ value: 'Panic! at the Disco', text: 'Panic! at the Disco' },
			{ value: 'The Weeknd', text: 'The Weeknd' },
			{ value: 'Bresh', text: 'Bresh' },
			{ value: 'Leon Faun', text: 'Leon Faun' },
			{ value: 'Olly', text: 'Olly' },
			{ value: 'Lazza', text: 'Lazza' },
			{ value: 'Bad Bunny', text: 'Bad Bunny' },
		],
		persist: false,
		create: true,
		maxItems: 1,
		maxOptions: 500,
		valueField: 'value',
		labelField: 'text',
		searchField: ['value', 'text'],
		onInitialize() {
			const val = store.selectedArtist
			if (val) {
				;(this as any).addOption({ value: val, text: val })
				;(this as any).setValue(val, true)
				emit('artist-changed', val)
			}
		},
		onChange: (val: string) => {
			store.setSelectedArtist(val || '')
			emit('artist-changed', val || '')
		},
		onType: (_str: string) => {
			// allow free typing but only trigger load when confirm/enter or selection change
		},
	})

	// Keep the UI in sync if the store value changes elsewhere
	watch(
		() => store.selectedArtist,
		(val) => {
			if (!tom) return
			if (val) {
				tom.addOption({ value: val, text: val })
				;(tom as any).setValue(val, true)
			} else {
				tom.clear(true)
			}
		}
	)
})

onBeforeUnmount(() => {
	if (tom) {
		tom.destroy()
		tom = null
	}
})
</script>

<template>
	<div class="flex items-center gap-3 mb-4 w-full">
		<label class="text-sm opacity-80 shrink-0">Artist</label>
		<input ref="artistInput" class="flex-1 min-w-0 w-full" placeholder="Pick or type an artist..." />
		<div class="ml-auto flex items-center gap-2 text-sm">
			<span class="opacity-80">Volume</span>
			<input type="range" min="0" max="100" step="1" v-model.number="volumePercent" class="w-32" />
			<span class="w-10 text-right tabular-nums">{{ volumePercent }}%</span>
		</div>
	</div>
</template>


