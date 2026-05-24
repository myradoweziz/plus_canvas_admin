<script setup lang="ts">
	import { watch } from 'vue'

	import Button from '@/shared/ui/Button.vue'
	import TextField from '@/shared/ui/TextField.vue'
	import ProductRequiresSaveNotice from './ProductRequiresSaveNotice.vue'

	import { api } from '../../api'
	import { useProductSubResourceSave } from '../../composables'
	import { validateProductDiscount } from '../../helpers'
	import type { CanvasProductDiscount } from '../../types'

	const props = defineProps<{
		productId: number | null
	}>()

	const productDiscount = defineModel<CanvasProductDiscount>('productDiscount', { required: true })

	const emit = defineEmits<{
		saved: [discount: CanvasProductDiscount]
	}>()

	const { saving, validationErrors, clearFieldError, runSave } = useProductSubResourceSave({
		validate: () => validateProductDiscount(productDiscount.value),
		save: () => api.updateCanvasProductDiscount(props.productId!, productDiscount.value),
		onSuccess: (savedDiscount) => {
			productDiscount.value = savedDiscount
			emit('saved', savedDiscount)
		},
		messages: {
			noProduct: 'Сначала сохраните продукт на вкладке Product Info',
			validation: 'Заполните поля скидки',
			success: 'Скидка успешно сохранена',
			error: 'Не удалось сохранить скидку'
		}
	})

	;(['discount', 'special_price', 'special_price_start', 'special_price_end'] as const).forEach((field) => {
		watch(
			() => productDiscount.value[field],
			() => clearFieldError(field)
		)
	})

	const onSaveDiscount = () => runSave(props.productId)
</script>

<template>
	<div class="contents">
		<ProductRequiresSaveNotice v-if="!productId" suffix=", затем заполните и сохраните скидку" />

		<TextField
			v-model.number="productDiscount.discount"
			label="Акция %"
			name="discount"
			type="number"
			min="0"
			:disabled="!productId"
			:error-message="validationErrors.discount"
		/>

		<TextField
			v-model.number="productDiscount.special_price"
			label="Спец. цена"
			name="special_price"
			type="number"
			min="0"
			:disabled="!productId"
			:error-message="validationErrors.special_price"
		/>

		<TextField
			v-model="productDiscount.special_price_start"
			label="Спец. цена с"
			name="special_price_start"
			type="date"
			:disabled="!productId"
			:error-message="validationErrors.special_price_start"
		/>

		<TextField
			v-model="productDiscount.special_price_end"
			label="Спец. цена до"
			name="special_price_end"
			type="date"
			:disabled="!productId"
			:error-message="validationErrors.special_price_end"
		/>

		<div class="mt-2 flex items-center justify-end gap-3 md:col-span-3">
			<Button type="button" size="sm" :disabled="!productId || saving" :loading="saving" :on-click="onSaveDiscount">
				{{ saving ? 'Сохранение скидки...' : 'Сохранить скидку' }}
			</Button>
		</div>
	</div>
</template>
