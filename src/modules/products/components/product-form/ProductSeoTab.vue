<script setup lang="ts">
	import { ref, watch } from 'vue'

	import Button from '@/shared/ui/Button.vue'
	import TextareaField from '@/shared/ui/TextareaField.vue'
	import TextField from '@/shared/ui/TextField.vue'
	import ProductRequiresSaveNotice from './ProductRequiresSaveNotice.vue'

	import { slugify } from '@/shared'
	import { api } from '../../api'
	import { useProductSubResourceSave } from '../../composables'
	import { validateProductSeo } from '../../helpers'
	import type { CanvasProductSeo } from '../../types'

	const props = defineProps<{
		productId: number | null
		productName: string
	}>()

	const seo = defineModel<CanvasProductSeo>('seo', { required: true })

	const emit = defineEmits<{
		saved: [seo: CanvasProductSeo]
	}>()

	const slugManuallyEdited = ref(false)

	const syncSlugManuallyEdited = () => {
		slugManuallyEdited.value = Boolean(seo.value.slug && seo.value.slug !== slugify(props.productName ?? ''))
	}

	const { saving, validationErrors, clearFieldError, runSave } = useProductSubResourceSave({
		validate: () => validateProductSeo(seo.value),
		save: () => api.updateCanvasProductSeo(props.productId!, seo.value),
		onSuccess: (savedSeo) => {
			seo.value = savedSeo
			syncSlugManuallyEdited()
			emit('saved', savedSeo)
		},
		messages: {
			noProduct: 'Сначала сохраните продукт на вкладке Product Info',
			validation: 'Заполните обязательные поля SEO',
			success: 'SEO успешно сохранено',
			error: 'Не удалось сохранить SEO'
		}
	})

	;(['slug', 'meta_title', 'meta_description', 'meta_keywords'] as const).forEach((field) => {
		watch(
			() => seo.value[field],
			() => clearFieldError(field)
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

	watch(
		() => props.productId,
		() => syncSlugManuallyEdited(),
		{ immediate: true }
	)

	const onSaveSeo = () => runSave(props.productId)
</script>

<template>
	<div class="contents">
		<ProductRequiresSaveNotice v-if="!productId" suffix=", затем заполните и сохраните SEO" />

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
