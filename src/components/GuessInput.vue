<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import TomSelect from 'tom-select'
import 'tom-select/dist/css/tom-select.css'
import { useGameStore } from '../stores/game'
const store = useGameStore()

const tomSelectEl = ref<HTMLInputElement | null>(null)
let tom: any = null

onMounted(() => {
	if (tomSelectEl.value) {
		tom = new TomSelect(tomSelectEl.value, {
			options: store.selectOptions,
			valueField: 'value',
			labelField: 'text',
			searchField: ['value', 'text'],
			persist: false,
			create: true,
			maxItems: 1,
			maxOptions: 500,
			onChange: (val: string) => {
				store.userGuess = val || ''
				if (val) store.submitGuess()
			},
			onType: (str: string) => {
				store.userGuess = str || ''
			},
		})
		// seed options and refresh immediately
		tom.clearOptions()
		tom.addOptions(store.selectOptions as any)
		tom.refreshOptions(false)
	}
})

watch(
	() => store.selectOptions,
	(opts) => {
		if (!tom) return
		tom.clearOptions()
		tom.addOptions(opts as any)
		tom.refreshOptions(false)
	}
)

// When artist changes, reset input and refresh options
watch(
	() => store.selectedArtist,
	() => {
		if (!tom) return
		store.userGuess = ''
		tom.clear(true)
		tom.clearOptions()
		tom.addOptions(store.selectOptions as any)
		tom.refreshOptions(false)
	}
)

// keep input in sync when cleared
watch(
	() => store.userGuess,
	(val) => {
		if (!tom) return
		if (!val) tom.clear(true)
	}
)

onBeforeUnmount(() => {
	if (tom) {
		tom.destroy()
		tom = null
	}
})
</script>

<template>
	<div class="flex items-center gap-2 mb-3">
		<label class="text-sm opacity-80">Guess</label>
		<input ref="tomSelectEl" class="flex-1 min-w-0 w-full" placeholder="Type song title..." />
	</div>
</template>


