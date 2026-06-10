import { ref, watch, type Ref } from 'vue'

import { slugify } from '@/shared'
import type { CanvasProduct } from '../types'

export const useProductSlugSync = (form: Ref<CanvasProduct>) => {
	const slugManuallyEdited = ref(false)

	const syncSlugManuallyEdited = () => {
		slugManuallyEdited.value = Boolean(
			form.value.seo.slug && form.value.seo.slug !== slugify(form.value.name ?? '')
		)
	}

	watch(
		() => form.value.name,
		(name) => {
			const generatedSlug = slugify(name ?? '')
			if (!slugManuallyEdited.value || !form.value.seo.slug) {
				form.value.seo.slug = generatedSlug
			}
		}
	)

	const onSlugManualInput = (slug: string) => {
		form.value.seo.slug = slug
		slugManuallyEdited.value = form.value.seo.slug !== slugify(form.value.name ?? '')
	}

	return {
		slugManuallyEdited,
		syncSlugManuallyEdited,
		onSlugManualInput
	}
}
