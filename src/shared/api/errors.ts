type BackendValidationErrors = Record<string, unknown>

export const getErrorData = (error: unknown) => {
	return (error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })?.response
		?.data
}

export const getValidationErrors = (error: unknown, fieldAliases: Record<string, string> = {}) => {
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

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null
}

function firstStringFromUnknown(value: unknown): string | null {
	if (typeof value === 'string' && value.trim()) return value
	if (Array.isArray(value)) {
		for (const item of value) {
			const message = firstStringFromUnknown(item)
			if (message) return message
		}
	}
	return null
}

/** Первое сообщение валидации от бэкенда (обычно Laravel-style 422). */
export const getFirstBackendValidationMessage = (error: unknown): string | null => {
	if (!isRecord(error)) return null

	const response = isRecord(error.response) ? error.response : null
	const status = response?.status
	if (status !== 422) return null

	const data = response && isRecord(response.data) ? response.data : null
	if (!data) return null

	const errors = data.errors
	if (isRecord(errors)) {
		for (const value of Object.values(errors as BackendValidationErrors)) {
			const message = firstStringFromUnknown(value)
			if (message) return message
		}
	}

	const message = firstStringFromUnknown(data.message)
	if (message) return message

	return null
}
