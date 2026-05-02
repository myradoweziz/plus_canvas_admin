export const getTotal = (response: unknown, fallback: number) => {
	if (!response || typeof response !== 'object') return fallback

	const data = response as {
		total?: number
		meta?: { total?: number }
		pagination?: { total?: number }
	}

	return data.total ?? data.meta?.total ?? data.pagination?.total ?? fallback
}
