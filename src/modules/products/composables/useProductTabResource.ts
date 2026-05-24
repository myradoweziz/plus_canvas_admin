import { ref, watch, type WatchSource } from 'vue'
import { toast } from 'vue3-toastify'

import { getErrorMessage } from '@/shared/api/errors'

export const useProductTabResource = <TItem>(
	productId: WatchSource<number | null>,
	loadFn: (id: number) => Promise<TItem[]>,
	errorMessage: string
) => {
	const items = ref<TItem[]>([])
	const loading = ref(false)
	const loadedForProductId = ref<number | null>(null)

	const load = async (force = false) => {
		const id = typeof productId === 'function' ? productId() : productId.value

		if (!id) {
			items.value = []
			loadedForProductId.value = null
			return
		}

		if (!force && loadedForProductId.value === id) return

		loading.value = true

		try {
			items.value = await loadFn(id)
			loadedForProductId.value = id
		} catch (error) {
			toast.error(getErrorMessage(error, errorMessage))
		} finally {
			loading.value = false
		}
	}

	watch(productId, () => {
		load()
	}, { immediate: true })

	const invalidate = () => {
		loadedForProductId.value = null
	}

	return {
		items,
		loading,
		load,
		invalidate
	}
}
