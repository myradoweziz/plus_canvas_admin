type BackendValidationErrors = Record<string, unknown>

function isRecord(v: unknown): v is Record<string, unknown> {
	return typeof v === 'object' && v !== null
}

function firstStringFromUnknown(v: unknown): string | null {
	if (typeof v === 'string' && v.trim()) return v
	if (Array.isArray(v)) {
		for (const item of v) {
			const s = firstStringFromUnknown(item)
			if (s) return s
		}
	}
	return null
}

/**
 * Возвращает первое сообщение валидации от бэкенда (обычно Laravel-style 422).
 * Если ошибка не 422 или структура неизвестна — вернёт null.
 */
export function getFirstBackendValidationMessage(err: unknown): string | null {
	if (!isRecord(err)) return null

	const response = isRecord(err.response) ? err.response : null
	const status = response?.status
	if (status !== 422) return null

	const data = response && isRecord(response.data) ? response.data : null
	if (!data) return null

	// 1) errors: { field: ["msg1", ...], ... }
	const errors = data.errors
	if (isRecord(errors)) {
		for (const value of Object.values(errors as BackendValidationErrors)) {
			const msg = firstStringFromUnknown(value)
			if (msg) return msg
		}
	}

	// 2) message: "..."
	const msg = firstStringFromUnknown(data.message)
	if (msg) return msg

	return null
}

