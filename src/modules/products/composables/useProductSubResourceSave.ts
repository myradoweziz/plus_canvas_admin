import { ref } from 'vue'
import { toast } from 'vue3-toastify'

import { getErrorMessage, getValidationErrors } from '@/shared/api/errors'
import { useFieldErrors } from './useFieldErrors'

type UseProductSubResourceSaveOptions<T> = {
	validate: () => Record<string, string>
	save: () => Promise<T>
	onSuccess?: (result: T) => void
	messages: {
		noProduct: string
		validation: string
		success: string
		error: string
	}
	fieldAliases?: Record<string, string>
}

export const useProductSubResourceSave = <T>(options: UseProductSubResourceSaveOptions<T>) => {
	const saving = ref(false)
	const { validationErrors, clearFieldError, clearAllValidationErrors, setValidationErrors } = useFieldErrors()

	const runSave = async (productId: number | null) => {
		if (!productId) {
			toast.error(options.messages.noProduct)
			return
		}

		const errors = options.validate()
		setValidationErrors(errors)
		if (Object.keys(errors).length > 0) {
			toast.error(Object.values(errors)[0] || options.messages.validation)
			return
		}

		saving.value = true
		clearAllValidationErrors()

		try {
			const result = await options.save()
			options.onSuccess?.(result)
			toast.success(options.messages.success)
		} catch (error) {
			setValidationErrors(getValidationErrors(error, options.fieldAliases))
			toast.error(getErrorMessage(error, options.messages.error))
		} finally {
			saving.value = false
		}
	}

	return {
		saving,
		validationErrors,
		clearFieldError,
		setValidationErrors,
		runSave
	}
}
