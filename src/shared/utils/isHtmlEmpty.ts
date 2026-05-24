export const isHtmlEmpty = (html: string | null | undefined): boolean => {
	if (!html?.trim()) return true

	const text = html
		.replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
		.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
		.replace(/<[^>]+>/g, ' ')
		.replace(/&nbsp;/gi, ' ')
		.replace(/\s+/g, ' ')
		.trim()

	return !text
}
