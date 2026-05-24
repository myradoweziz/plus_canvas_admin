import { ref } from 'vue'

export const useFieldErrors = () => {
	const validationErrors = ref<Record<string, string>>({})

	const clearFieldError = (field: string) => {
		if (!validationErrors.value[field]) return
		const next = { ...validationErrors.value }
		delete next[field]
		validationErrors.value = next
	}

	const setValidationErrors = (errors: Record<string, string>) => {
		validationErrors.value = errors
	}

	const clearAllValidationErrors = () => {
		validationErrors.value = {}
	}

	return {
		validationErrors,
		clearFieldError,
		setValidationErrors,
		clearAllValidationErrors
	}
}
