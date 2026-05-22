export const getErrorData = (error: unknown) => {
	return (error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })?.response?.data
}

export const getValidationErrors = (
	error: unknown,
	fieldAliases: Record<string, string> = {}
) => {
	const errors = getErrorData(error)?.errors
	if (!errors) return {}

	return Object.fromEntries(
		Object.entries(errors).map(([field, messages]) => {
			const targetField = fieldAliases[field] ?? field
			const message = Array.isArray(messages) ? messages[0] : messages
			return [targetField, message ?? 'Некорректное значение']
		})
	)
}

export const getErrorMessage = (error: unknown, fallback: string) => {
	const data = getErrorData(error)
	const firstValidationMessage = Object.values(data?.errors || {})[0]?.[0]

	return firstValidationMessage || data?.message || fallback
}
