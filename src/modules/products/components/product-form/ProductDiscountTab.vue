<script setup lang="ts">
	import { ref, watch } from 'vue'
	import { toast } from 'vue3-toastify'

	import Button from '@/shared/ui/Button.vue'
	import TextField from '@/shared/ui/TextField.vue'

	import { api } from '../../api'
	import { getErrorMessage, getValidationErrors } from '../../helpers/form-errors'
	import { validateProductDiscount } from '../../helpers/product-form-validation'
	import type { CanvasProductDiscount } from '../../types/product'

	const props = defineProps<{
		productId: number | null
	}>()

	const productDiscount = defineModel<CanvasProductDiscount>('productDiscount', { required: true })

	const emit = defineEmits<{
		saved: [discount: CanvasProductDiscount]
	}>()

	const saving = ref(false)
	const validationErrors = ref<Record<string, string>>({})

	const clearValidationError = (field: string) => {
		if (!validationErrors.value[field]) return
		const next = { ...validationErrors.value }
		delete next[field]
		validationErrors.value = next
	}

	;(['discount', 'special_price', 'special_price_start', 'special_price_end'] as const).forEach((field) => {
		watch(
			() => productDiscount.value[field],
			() => clearValidationError(field)
		)
	})

	const onSaveDiscount = async () => {
		if (!props.productId) {
			toast.error('Сначала сохраните продукт на вкладке Product Info')
			return
		}

		validationErrors.value = validateProductDiscount(productDiscount.value)
		if (Object.keys(validationErrors.value).length > 0) {
			toast.error(Object.values(validationErrors.value)[0] || 'Заполните поля скидки')
			return
		}

		saving.value = true

		try {
			const savedDiscount = await api.updateCanvasProductDiscount(props.productId, productDiscount.value)
			productDiscount.value = savedDiscount
			emit('saved', savedDiscount)
			toast.success('Скидка успешно сохранена')
		} catch (error) {
			validationErrors.value = getValidationErrors(error)
			toast.error(getErrorMessage(error, 'Не удалось сохранить скидку'))
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
			Сначала сохраните продукт на вкладке <strong>Product Info</strong>, затем заполните и сохраните скидку.
		</div>

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
			<Button
				type="button"
				size="sm"
				:disabled="!productId || saving"
				:loading="saving"
				:on-click="onSaveDiscount"
			>
				{{ saving ? 'Сохранение скидки...' : 'Сохранить скидку' }}
			</Button>
		</div>
	</div>
</template>
