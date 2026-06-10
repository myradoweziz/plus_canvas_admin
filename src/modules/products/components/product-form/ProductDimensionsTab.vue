<script setup lang="ts">
	import { defineAsyncComponent, watch } from 'vue'

	import Button from '@/shared/ui/Button.vue'
	import ProductRequiresSaveNotice from './ProductRequiresSaveNotice.vue'

	const RichTextEditor = defineAsyncComponent(() => import('@/shared/ui/RichTextEditor.vue'))

	import { api } from '../../api'
	import { useProductSubResourceSave } from '../../composables'

	const props = defineProps<{
		productId: number | null
	}>()

	const productDimensions = defineModel<string>('productDimensions', { required: true })

	const { saving, validationErrors, clearFieldError, runSave } = useProductSubResourceSave({
		validate: () => ({}),
		save: () => api.updateCanvasProductDimensions(props.productId!, productDimensions.value),
		onSuccess: (savedDimensions) => {
			productDimensions.value = savedDimensions
		},
		messages: {
			noProduct: 'Сначала сохраните продукт на вкладке Product Info',
			validation: 'Проверьте поле размеров',
			success: 'Размеры продукта успешно сохранены',
			error: 'Не удалось сохранить размеры продукта'
		}
	})

	watch(
		() => productDimensions.value,
		() => clearFieldError('product_dimensions')
	)

	const onSave = () => runSave(props.productId)
</script>

<template>
	<div class="contents">
		<ProductRequiresSaveNotice v-if="!productId" suffix=", затем заполните и сохраните размеры" />

		<div class="md:col-span-3">
			<RichTextEditor
				v-model="productDimensions"
				label="Product dimensions"
				name="product_dimensions"
				placeholder="Размеры продукта"
				:disabled="!productId"
				:error-message="validationErrors.product_dimensions"
			/>
		</div>

		<div class="mt-2 flex items-center justify-end gap-3 md:col-span-3">
			<Button type="button" size="sm" :disabled="!productId || saving" :loading="saving" :on-click="onSave">
				{{ saving ? 'Сохранение...' : 'Сохранить размеры' }}
			</Button>
		</div>
	</div>
</template>
