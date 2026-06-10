import { ref, watch, type Ref } from 'vue'

import { looksLikeUnslugifiedSlug, slugify } from '@/shared'
import type { CanvasProduct } from '../types'

export const useProductSlugSync = (form: Ref<CanvasProduct>) => {
	const slugManuallyEdited = ref(false)
	const lastGeneratedSlug = ref('')

	const shouldAutoSyncSlug = (name: string, slug: string) => {
		if (!slug.trim()) return true

		return looksLikeUnslugifiedSlug(slug, name)
	}

	const syncSlugManuallyEdited = () => {
		const name = form.value.name ?? ''
		const slug = form.value.seo.slug ?? ''
		const generatedSlug = slugify(name)

		lastGeneratedSlug.value = generatedSlug

		if (shouldAutoSyncSlug(name, slug)) {
			slugManuallyEdited.value = false
			if (name.trim()) {
				form.value.seo.slug = generatedSlug
			}
			return
		}

		slugManuallyEdited.value = slug !== generatedSlug
	}

	watch(
		() => form.value.name,
		(name) => {
			const generatedSlug = slugify(name ?? '')
			const currentSlug = form.value.seo.slug ?? ''

			if (
				!slugManuallyEdited.value ||
				!currentSlug.trim() ||
				currentSlug === lastGeneratedSlug.value ||
				shouldAutoSyncSlug(name ?? '', currentSlug)
			) {
				form.value.seo.slug = generatedSlug
				slugManuallyEdited.value = false
			}

			lastGeneratedSlug.value = generatedSlug
		}
	)

	const onSlugManualInput = (slug: string) => {
		form.value.seo.slug = slug
		slugManuallyEdited.value = slug !== lastGeneratedSlug.value
	}

	return {
		slugManuallyEdited,
		syncSlugManuallyEdited,
		onSlugManualInput
	}
}
