<script setup lang="ts">
	import { ref, watch } from 'vue'
	import { toast } from 'vue3-toastify'

	import Button from '@/shared/ui/Button.vue'
	import TextareaField from '@/shared/ui/TextareaField.vue'
	import TextField from '@/shared/ui/TextField.vue'

	import { slugify } from '@/shared'
	import { api } from '../../api'
	import { getErrorMessage, getValidationErrors } from '../../helpers/form-errors'
	import { validateProductSeo } from '../../helpers/product-form-validation'
	import type { CanvasProductSeo } from '../../types/product'

	const props = defineProps<{
		productId: number | null
		productName: string
	}>()

	const seo = defineModel<CanvasProductSeo>('seo', { required: true })

	const emit = defineEmits<{
		saved: [seo: CanvasProductSeo]
	}>()

	const saving = ref(false)
	const validationErrors = ref<Record<string, string>>({})
	const slugManuallyEdited = ref(false)

	const clearValidationError = (field: string) => {
		if (!validationErrors.value[field]) return
		const next = { ...validationErrors.value }
		delete next[field]
		validationErrors.value = next
	}

	;(['slug', 'meta_title', 'meta_description', 'meta_keywords'] as const).forEach((field) => {
		watch(
			() => seo.value[field],
			() => clearValidationError(field)
		)
	})

	watch(
		() => props.productName,
		(name) => {
			const generatedSlug = slugify(name ?? '')
			if (!slugManuallyEdited.value || !seo.value.slug) {
				seo.value.slug = generatedSlug
			}
		}
	)

	const onSlugInput = (value: string | number) => {
		seo.value.slug = String(value)
		slugManuallyEdited.value = seo.value.slug !== slugify(props.productName ?? '')
	}

	const syncSlugManuallyEdited = () => {
		slugManuallyEdited.value = Boolean(seo.value.slug && seo.value.slug !== slugify(props.productName ?? ''))
	}

	watch(
		() => props.productId,
		() => syncSlugManuallyEdited(),
		{ immediate: true }
	)

	const onSaveSeo = async () => {
		if (!props.productId) {
			toast.error('Сначала сохраните продукт на вкладке Product Info')
			return
		}

		validationErrors.value = validateProductSeo(seo.value)
		if (Object.keys(validationErrors.value).length > 0) {
			toast.error(Object.values(validationErrors.value)[0] || 'Заполните обязательные поля SEO')
			return
		}

		saving.value = true

		try {
			const savedSeo = await api.updateCanvasProductSeo(props.productId, seo.value)
			seo.value = savedSeo
			syncSlugManuallyEdited()
			emit('saved', savedSeo)
			toast.success('SEO успешно сохранено')
		} catch (error) {
			validationErrors.value = getValidationErrors(error)
			toast.error(getErrorMessage(error, 'Не удалось сохранить SEO'))
		} finally {
			saving.value = false
		}
	}
</script>

<template>
	<div class="contents">
		<div
			v-if="!productId"
			class="md:col-span-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
		>
			Сначала сохраните продукт на вкладке <strong>Product Info</strong>, затем заполните и сохраните SEO.
		</div>

		<div class="md:col-span-3">
			<TextField
				v-model.trim="seo.slug"
				label="Slug"
				required
				name="seo_slug"
				placeholder="product-slug"
				:disabled="!productId"
				:error-message="validationErrors.slug"
				@update:model-value="onSlugInput"
			/>
		</div>

		<div class="md:col-span-3">
			<TextField
				v-model.trim="seo.meta_title"
				label="Meta title"
				required
				name="meta_title"
				placeholder="Meta title"
				:disabled="!productId"
				:error-message="validationErrors.meta_title"
			/>
		</div>

		<div class="md:col-span-3">
			<TextareaField
				v-model.trim="seo.meta_description"
				label="Meta description"
				required
				name="meta_description"
				placeholder="Meta description"
				:disabled="!productId"
				:error-message="validationErrors.meta_description"
			/>
		</div>

		<div class="md:col-span-3">
			<TextField
				v-model.trim="seo.meta_keywords"
				label="Meta keywords"
				required
				name="meta_keywords"
				placeholder="keyword1, keyword2"
				:disabled="!productId"
				:error-message="validationErrors.meta_keywords"
			/>
		</div>

		<div class="mt-2 flex items-center justify-end gap-3 md:col-span-3">
			<Button type="button" size="sm" :disabled="!productId || saving" :loading="saving" :on-click="onSaveSeo">
				{{ saving ? 'Сохранение SEO...' : 'Сохранить SEO' }}
			</Button>
		</div>
	</div>
</template>
