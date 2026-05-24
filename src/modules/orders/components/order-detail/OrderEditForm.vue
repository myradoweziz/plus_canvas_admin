<script setup lang="ts">
	import { ref, watch } from 'vue'
	import { toast } from 'vue3-toastify'

	import { useFieldErrors } from '@/modules/products/composables'
	import { getErrorMessage, getValidationErrors } from '@/shared/api/errors'
	import Button from '@/shared/ui/Button.vue'
	import SelectField from '@/shared/ui/SelectField.vue'
	import TextField from '@/shared/ui/TextField.vue'

	import { api } from '../../api'
	import {
		DELIVERY_STATUS_OPTIONS,
		ORDER_STATUS_OPTIONS,
		PAYMENT_STATUS_OPTIONS
	} from '../../helpers'
	import type { Order } from '../../types'

	const props = defineProps<{
		order: Order
	}>()

	const emit = defineEmits<{
		(e: 'saved', order: Order): void
	}>()

	const saving = ref(false)
	const { validationErrors, clearFieldError, setValidationErrors, clearAllValidationErrors } = useFieldErrors()

	const form = ref({
		order_status: '',
		payment_status: '',
		delivery_status: '',
		subtotal: 0,
		tax: 0,
		shipping_cost: 0,
		discount_amount: 0,
		total: 0
	})

	const toNumber = (value: string | number | null | undefined) => {
		const parsed = Number(value)
		return Number.isFinite(parsed) ? parsed : 0
	}

	const syncForm = (order: Order) => {
		form.value = {
			order_status: order.order_status ?? '',
			payment_status: order.payment_status ?? '',
			delivery_status: order.delivery_status ?? '',
			subtotal: toNumber(order.subtotal),
			tax: toNumber(order.tax),
			shipping_cost: toNumber(order.shipping_cost),
			discount_amount: toNumber(order.discount_amount),
			total: toNumber(order.total)
		}
	}

	watch(
		() => props.order,
		(order) => syncForm(order),
		{ immediate: true }
	)

	const save = async () => {
		if (!props.order.id) return

		saving.value = true
		clearAllValidationErrors()

		try {
			const updated = await api.updateOrder(props.order.id, { ...form.value })
			emit('saved', updated)
			toast.success('Заказ обновлён')
		} catch (error) {
			setValidationErrors(getValidationErrors(error))
			toast.error(getErrorMessage(error, 'Не удалось сохранить заказ'))
		} finally {
			saving.value = false
		}
	}
</script>

<template>
	<form class="space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4" @submit.prevent="save">
		<h4 class="text-sm font-semibold text-gray-900">Редактирование заказа</h4>

		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
			<SelectField
				v-model="form.order_status"
				label="Статус заказа"
				name="order_status"
				placeholder="Выберите статус"
				:options="ORDER_STATUS_OPTIONS"
				:error-message="validationErrors.order_status"
				@update:model-value="clearFieldError('order_status')"
			/>
			<SelectField
				v-model="form.payment_status"
				label="Статус оплаты"
				name="payment_status"
				placeholder="Выберите статус"
				:options="PAYMENT_STATUS_OPTIONS"
				:error-message="validationErrors.payment_status"
				@update:model-value="clearFieldError('payment_status')"
			/>
			<SelectField
				v-model="form.delivery_status"
				label="Статус доставки"
				name="delivery_status"
				placeholder="Выберите статус"
				:options="DELIVERY_STATUS_OPTIONS"
				:error-message="validationErrors.delivery_status"
				@update:model-value="clearFieldError('delivery_status')"
			/>
			<TextField
				v-model.number="form.subtotal"
				label="Подытог"
				name="subtotal"
				type="number"
				min="0"
				step="0.01"
				:error-message="validationErrors.subtotal"
				@update:model-value="clearFieldError('subtotal')"
			/>
			<TextField
				v-model.number="form.tax"
				label="Налог"
				name="tax"
				type="number"
				min="0"
				step="0.01"
				:error-message="validationErrors.tax"
				@update:model-value="clearFieldError('tax')"
			/>
			<TextField
				v-model.number="form.shipping_cost"
				label="Доставка"
				name="shipping_cost"
				type="number"
				min="0"
				step="0.01"
				:error-message="validationErrors.shipping_cost"
				@update:model-value="clearFieldError('shipping_cost')"
			/>
			<TextField
				v-model.number="form.discount_amount"
				label="Скидка"
				name="discount_amount"
				type="number"
				min="0"
				step="0.01"
				:error-message="validationErrors.discount_amount"
				@update:model-value="clearFieldError('discount_amount')"
			/>
			<TextField
				v-model.number="form.total"
				label="Итого"
				name="total"
				type="number"
				min="0"
				step="0.01"
				:error-message="validationErrors.total"
				@update:model-value="clearFieldError('total')"
			/>
		</div>

		<div class="flex justify-end">
			<Button type="submit" size="sm" :disabled="saving">
				{{ saving ? 'Сохранение...' : 'Сохранить' }}
			</Button>
		</div>
	</form>
</template>
