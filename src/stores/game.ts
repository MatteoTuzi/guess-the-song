import { defineStore } from 'pinia'
import confetti from 'canvas-confetti'
import { searchDeezerTracksPaged } from '../services/deezer'
import { canPlayUrl } from '../utils/audio'

export type Song = {
	title: string
	artist?: string
	url: string
	cover?: string
}

type Guess = { text: string; correct: boolean; snippet: number }

type CelebrateItem = { id: number; emoji: string; left: string; delayMs: number; durationMs: number; rotate: number }

const SELECTED_ARTIST_KEY = 'gts:selectedArtist'
const STATS_KEY = 'gts:stats'

export const useGameStore = defineStore('game', {
	state: () => ({
		songs: [] as Song[],
		snippetDurationsSeconds: [1, 5, 9, 14, 19] as number[],
		attemptsUsed: 0,
		hintsUsed: 0,
		currentSong: null as Song | null,
		lastSongUrl: null as string | null,
		selectedArtist: (typeof localStorage !== 'undefined' && localStorage.getItem(SELECTED_ARTIST_KEY)) || 'Lady Gaga',
		userGuess: '',
		feedback: '',
		hasEnded: false,
		guesses: [] as Guess[],
		volume: 0.4,
		progressMs: 0,
		isCelebrating: false,
		celebrateItems: [] as CelebrateItem[],
		didWin: false,
		// DOM references managed via store for simplicity of integration
		audioEl: null as HTMLAudioElement | null,
		// stats
		stats: (() => {
			const defaults = {
				songsStarted: 0,
				songsSkipped: 0,
				songsCompleted: 0,
				totalGuesses: 0,
				correctGuesses: 0,
				wrongGuesses: 0,
				totalSnippetPlays: 0,
				totalSnippetMsPlayed: 0,
				snippetSecondsAtCorrect: [] as number[],
				hintsUsed: 0,
			}
			try {
				if (typeof localStorage !== 'undefined') {
					const raw = localStorage.getItem(STATS_KEY)
					if (raw) {
						const parsed = JSON.parse(raw)
						return { ...defaults, ...parsed }
					}
				}
			} catch {}
			return defaults
		})(),
		// timers
		_rafId: null as number | null,
		_stopTimeoutId: null as number | null,
	}),
	getters: {
		attemptsLeft(state): number {
			return Math.max(0, 5 - (state.attemptsUsed + state.hintsUsed))
		},
		currentSnippetSeconds(state): number {
			const idx = Math.min(state.attemptsUsed + state.hintsUsed, state.snippetDurationsSeconds.length - 1)
			return state.snippetDurationsSeconds[idx]
		},
		playableSongs(state): Song[] {
			return state.songs.filter((s) => canPlayUrl(s.url))
		},
		selectOptions(): { value: string; text: string }[] {
			return this.playableSongs.map((s) => ({ value: s.title, text: `${s.title}${s.artist ? ' — ' + s.artist : ''}` }))
		},
		accuracy(state): number {
			const total = state.stats.totalGuesses
			return total ? state.stats.correctGuesses / total : 0
		},
		averageSnippetSecondsWhenCorrect(state): number {
			const arr = state.stats.snippetSecondsAtCorrect
			if (!arr.length) return 0
			return arr.reduce((a: number, b: number) => a + b, 0) / arr.length
		},
	},
	actions: {
		_saveStats() {
			try {
				if (typeof localStorage !== 'undefined') {
					localStorage.setItem(STATS_KEY, JSON.stringify(this.stats))
				}
			} catch {}
		},
		setSelectedArtist(artist: string) {
			this.selectedArtist = artist
			try {
				if (typeof localStorage !== 'undefined') {
					localStorage.setItem(SELECTED_ARTIST_KEY, artist)
				}
			} catch {}
		},
		setAudioEl(el: HTMLAudioElement | null) {
			this.audioEl = el
			if (this.audioEl) {
				this.audioEl.volume = this.volume
			}
		},
		pickRandomSong() {
			const pool = this.playableSongs.length ? this.playableSongs : this.songs
			if (pool.length === 0) {
				this.currentSong = null
				return
			}
			if (pool.length === 1) {
				this.currentSong = pool[0]
				this.lastSongUrl = this.currentSong.url
				return
			}
			let candidate: Song | null = null
			do {
				candidate = pool[Math.floor(Math.random() * pool.length)]
			} while (candidate.url === this.lastSongUrl)
			this.currentSong = candidate
			this.lastSongUrl = candidate.url
		},
		resetGame() {
			this.stopAudio()
			this.attemptsUsed = 0
			this.hintsUsed = 0
			this.userGuess = ''
			this.feedback = ''
			this.hasEnded = false
			this.didWin = false
			this.guesses = []
			this.progressMs = 0
			this.pickRandomSong()
			this.stats.songsStarted += 1
			this._saveStats()
		},
		_stopTicking() {
			if (this._rafId !== null) {
				cancelAnimationFrame(this._rafId)
				this._rafId = null
			}
		},
		cancelSnippetTimers() {
			if (this._stopTimeoutId !== null) {
				clearTimeout(this._stopTimeoutId)
				this._stopTimeoutId = null
			}
			this._stopTicking()
		},
		stopAudio() {
			const el = this.audioEl
			if (!el) return
			el.pause()
			el.currentTime = 0
			if (this._stopTimeoutId !== null) {
				clearTimeout(this._stopTimeoutId)
				this._stopTimeoutId = null
			}
			this._stopTicking()
		},
		beginSnippetPlaybackFromCurrentTime() {
			const el = this.audioEl
			if (!el) return

			const msTotal = this.currentSnippetSeconds * 1000
			const remainingMs = Math.max(0, msTotal - el.currentTime * 1000)
			this._stopTicking()
			if (this._stopTimeoutId !== null) {
				clearTimeout(this._stopTimeoutId)
				this._stopTimeoutId = null
			}
			this.stats.totalSnippetPlays += 1
			this.stats.totalSnippetMsPlayed += remainingMs
			this._saveStats()
			const tick = () => {
				const current = Math.min(el.currentTime * 1000, msTotal)
				this.progressMs = current
				if (current < msTotal && !el.paused) {
					this._rafId = requestAnimationFrame(tick)
				}
			}
			this._rafId = requestAnimationFrame(tick)
			el.play().catch(() => {})
			this._stopTimeoutId = window.setTimeout(() => {
				el.pause()
			}, remainingMs)
		},
		async playSnippet() {
			if (this.hasEnded) return
			const el = this.audioEl
			if (!el || !this.currentSong) return
			try {
				this.stopAudio()
				this.progressMs = 0
				this.beginSnippetPlaybackFromCurrentTime()
			} catch (e) {
				this.feedback = 'Audio playback blocked. Click play again.'
			}
		},
		normalize(text: string) {
			return text.trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ')
		},
		submitGuess() {
			if (!this.currentSong || this.hasEnded) return
			if (this.attemptsLeft <= 0) {
				this.feedback = `No attempts left. It was "${this.currentSong.title}"${this.currentSong.artist ? ' — ' + this.currentSong.artist : ''}`
				this.hasEnded = true
				this.didWin = false
				this.stopAudio()
				return
			}
			this.stats.totalGuesses += 1
			const correct = this.normalize(this.userGuess).includes(this.normalize(this.currentSong.title))
			if (correct) {
				this.stats.correctGuesses += 1
				this.stats.snippetSecondsAtCorrect.push(this.currentSnippetSeconds)
				this.feedback = `Correct! ${this.currentSong.title}${this.currentSong.artist ? ' — ' + this.currentSong.artist : ''}`
				this.guesses.push({ text: this.userGuess, correct: true, snippet: this.currentSnippetSeconds })
				this.hasEnded = true
				this.didWin = true
				this.stats.songsCompleted += 1
				this._saveStats()
				this.stopAudio()
				this.triggerCelebration()
				return
			}
			this.stats.wrongGuesses += 1
			this.guesses.push({ text: this.userGuess, correct: false, snippet: this.currentSnippetSeconds })
			this.attemptsUsed += 1
			this.progressMs = 0
			if (this.attemptsUsed + this.hintsUsed >= 5) {
				this.feedback = `Out of guesses. It was "${this.currentSong.title}"${this.currentSong.artist ? ' — ' + this.currentSong.artist : ''}`
				this.hasEnded = true
				this.didWin = false
				this.stats.songsCompleted += 1
				this._saveStats()
				this.stopAudio()
				return
			}
			this.feedback = `Incorrect. ${this.attemptsLeft} guesses left. Snippet: ${this.currentSnippetSeconds}s`
			this.userGuess = ''
		},
		giveHint() {
			if (!this.currentSong || this.hasEnded) return
			if (this.attemptsLeft <= 0) {
				this.feedback = `No attempts left. It was "${this.currentSong?.title}"${this.currentSong?.artist ? ' — ' + this.currentSong.artist : ''}`
				this.hasEnded = true
				this.stopAudio()
				return
			}
			const maxIdx = this.snippetDurationsSeconds.length - 1
			const currentIdx = Math.min(this.attemptsUsed + this.hintsUsed, maxIdx)
			if (currentIdx >= maxIdx) {
				this.feedback = `No more hints available. Max snippet length is ${this.snippetDurationsSeconds[maxIdx]}s`
				return
			}
			this.hintsUsed += 1
			this.stats.hintsUsed += 1
			this._saveStats()
			this.stopAudio()
			this.progressMs = 0
			this.feedback = `Hint used. Snippet extended to ${this.currentSnippetSeconds}s`
		},
		triggerCelebration() {
			this.isCelebrating = true
			const durationMs = 2500
			const end = Date.now() + durationMs
			;(function frame() {
				confetti({ particleCount: 6, spread: 70, startVelocity: 45, ticks: 120, origin: { x: Math.random(), y: Math.random() * 0.3 + 0.1 } })
				if (Date.now() < end) requestAnimationFrame(frame)
			})()
			const emojis = ['🎉', '🥳', '🎊', '🎺', '🎈']
			this.celebrateItems = Array.from({ length: 20 }, (_, i) => ({
				id: i,
				emoji: emojis[Math.floor(Math.random() * emojis.length)],
				left: `${Math.random() * 100}%`,
				delayMs: Math.floor(Math.random() * 600),
				durationMs: 2000 + Math.floor(Math.random() * 1400),
				rotate: Math.floor(Math.random() * 60) - 30,
			}))
			setTimeout(() => {
				this.isCelebrating = false
			}, durationMs + 800)
		},
		changeSong() {
			if (this.currentSong) {
				this.feedback = `Answer: ${this.currentSong.title}${this.currentSong.artist ? ' — ' + this.currentSong.artist : ''}`
			}
			if (!this.hasEnded && this.currentSong) {
				this.stats.songsSkipped += 1
				this._saveStats()
			}
			this.stopAudio()
			this.userGuess = ''
			this.attemptsUsed = 0
			this.hintsUsed = 0
			this.hasEnded = false
			this.didWin = false
			this.guesses = []
			this.progressMs = 0
			this.pickRandomSong()
			this.stats.songsStarted += 1
			this._saveStats()
		},
		setVolume(v: number) {
			this.volume = Math.max(0, Math.min(1, v))
			if (this.audioEl) this.audioEl.volume = this.volume
		},
		seekTo(seconds: number) {
			const el = this.audioEl
			if (!el) return
			el.currentTime = seconds
			this.progressMs = seconds * 1000
		},
		async loadArtistMp3Songs(artistName: string, pages = 8) {
			this.feedback = `Loading ${artistName} tracks...`
			try {
				const altQueries: string[] = []
				if (/panic/i.test(artistName)) {
					altQueries.push('Panic! at the Disco', 'Panic at the Disco')
				}
				if (/weekend/i.test(artistName)) {
					altQueries.push('The Weeknd')
				}
				const queries = [`artist:"${artistName}"`, `${artistName}`, ...altQueries]
				const resultsArrays = await Promise.all(queries.map((q) => searchDeezerTracksPaged(q, pages, 25, 'RANKING')))
				const seen = new Set<string>()
				const merged: Song[] = []
				for (const arr of resultsArrays) {
					for (const t of arr) {
						if (!(t as any).preview) continue
						const path = new URL((t as any).preview, window.location.origin).pathname
						if (!path.endsWith('.mp3')) continue
						const key = `${(t as any).title}|${(t as any).artist?.name}|${path}`
						if (seen.has(key)) continue
						if (!(t as any).artist?.name) continue
						const artistLower = (t as any).artist.name.toLowerCase()
						const targetLower = artistName.toLowerCase()
						const matchArtist =
							artistLower.includes(targetLower) ||
							(/panic/i.test(targetLower) && /panic!? at the disco/.test(artistLower)) ||
							(/weekend/i.test(targetLower) && /weeknd/.test(artistLower))
						if (!matchArtist) continue
						seen.add(key)
						const cover = (t as any).album?.cover_medium || (t as any).album?.cover || undefined
						merged.push({ title: (t as any).title, artist: (t as any).artist?.name, url: (t as any).preview, cover })
					}
				}
				this.songs = merged
				this.resetGame()
				this.feedback = `Loaded ${merged.length} ${artistName} tracks`
			} catch (e) {
				this.feedback = `Failed to load ${artistName} tracks`
			}
		},
	},
})


