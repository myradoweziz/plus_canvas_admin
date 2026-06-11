export * from './usePermissions'
export * from './useSidebar'

export const downloadTextFile = (content: string, filename: string, mimeType: string) => {
	const blob = new Blob([content], { type: mimeType })
	const url = URL.createObjectURL(blob)
	const link = document.createElement('a')
	link.href = url
	link.download = filename
	link.click()
	URL.revokeObjectURL(url)
}

export const downloadBlob = (blob: Blob, filename: string) => {
	const url = URL.createObjectURL(blob)
	const link = document.createElement('a')
	link.href = url
	link.download = filename
	link.click()
	URL.revokeObjectURL(url)
}

export const formatDate = (value: string) => {
	const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	})

	if (!value) return '—'
	const date = new Date(value)
	return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date)
}
