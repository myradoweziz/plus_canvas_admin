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
		transaction_id: '',
		discount_name: ''
	})

	const syncForm = (order: Order) => {
		form.value = {
			order_status: order.order_status ?? '',
			payment_status: order.payment_status ?? '',
			delivery_status: order.delivery_status ?? '',
			transaction_id: order.transaction_id ?? '',
			discount_name: order.discount_name ?? ''
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
			const updated = await api.updateOrder(props.order.id, {
				order_status: form.value.order_status,
				payment_status: form.value.payment_status,
				delivery_status: form.value.delivery_status,
				transaction_id: form.value.transaction_id,
				discount_name: form.value.discount_name
			})
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
				v-model.trim="form.transaction_id"
				label="Transaction ID"
				name="transaction_id"
				placeholder="cbdf89d0-..."
				:error-message="validationErrors.transaction_id"
				@update:model-value="clearFieldError('transaction_id')"
			/>
			<TextField
				v-model.trim="form.discount_name"
				label="Название скидки"
				name="discount_name"
				placeholder="Название скидки"
				:error-message="validationErrors.discount_name"
				@update:model-value="clearFieldError('discount_name')"
			/>
		</div>

		<div class="flex justify-end">
			<Button type="submit" size="sm" :disabled="saving">
				{{ saving ? 'Сохранение...' : 'Сохранить' }}
			</Button>
		</div>
	</form>
</template>
