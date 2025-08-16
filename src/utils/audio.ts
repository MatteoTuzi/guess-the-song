export function getPathname(url: string): string {
	try {
		return new URL(url).pathname
	} catch {
		return url.split('?')[0]
	}
}

export function getMimeFromUrl(url: string): string {
	const path = getPathname(url)
	if (path.endsWith('.ogg')) return 'audio/ogg'
	if (path.endsWith('.mp3')) return 'audio/mpeg'
	return ''
}

export function canPlayUrl(url: string): boolean {
	const mime = getMimeFromUrl(url)
	const probe = document.createElement('audio')
	if (!probe || !(probe as any).canPlayType || !mime) return true
	return probe.canPlayType(mime) !== ''
}


