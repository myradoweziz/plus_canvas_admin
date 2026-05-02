export type DebouncedFunction<TArgs extends unknown[]> = ((...args: TArgs) => void) & {
	cancel: () => void
}

export function debounce<TArgs extends unknown[]>(callback: (...args: TArgs) => void, delay = 300): DebouncedFunction<TArgs> {
	let timer: ReturnType<typeof setTimeout> | null = null

	const debounced = ((...args: TArgs) => {
		if (timer) {
			clearTimeout(timer)
		}

		timer = setTimeout(() => {
			callback(...args)
			timer = null
		}, delay)
	}) as DebouncedFunction<TArgs>

	debounced.cancel = () => {
		if (!timer) return

		clearTimeout(timer)
		timer = null
	}

	return debounced
}

