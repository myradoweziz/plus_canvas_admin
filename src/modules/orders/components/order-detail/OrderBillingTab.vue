<script setup lang="ts">
	import { ref, watch } from 'vue'
	import { toast } from 'vue3-toastify'

	import { useFieldErrors } from '@/modules/products/composables'
	import { getErrorMessage, getValidationErrors } from '@/shared/api/errors'
	import Button from '@/shared/ui/Button.vue'
	import TextField from '@/shared/ui/TextField.vue'

	import { api } from '../../api'
	import type { Order } from '../../types'

	const props = defineProps<{
		order: Order
	}>()

	const emit = defineEmits<{
		(e: 'saved', order: Order): void
	}>()

	const saving = ref(false)
	const { validationErrors, clearFieldError, setValidationErrors, clearAllValidationErrors } = useFieldErrors()

	const emptyBillingForm = () => ({
		billing_first_name: '',
		billing_last_name: '',
		billing_email: '',
		billing_phone: '',
		billing_company: '',
		billing_address: '',
		billing_city: '',
		billing_district: '',
		billing_postal_code: '',
		billing_country: '',
		billing_tax_number: '',
		billing_tax_office: ''
	})

	const form = ref(emptyBillingForm())

	const toString = (value: string | null | undefined) => value ?? ''

	const syncForm = (order: Order) => {
		form.value = {
			billing_first_name: toString(order.billing_first_name),
			billing_last_name: toString(order.billing_last_name),
			billing_email: toString(order.billing_email),
			billing_phone: toString(order.billing_phone),
			billing_company: toString(order.billing_company),
			billing_address: toString(order.billing_address),
			billing_city: toString(order.billing_city),
			billing_district: toString(order.billing_district),
			billing_postal_code: toString(order.billing_postal_code),
			billing_country: toString(order.billing_country),
			billing_tax_number: toString(order.billing_tax_number),
			billing_tax_office: toString(order.billing_tax_office)
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
			const updated = await api.updateOrderBillingAddress(props.order.id, { ...form.value })
			emit('saved', updated)
			toast.success('Billing-данные обновлены')
		} catch (error) {
			setValidationErrors(getValidationErrors(error))
			toast.error(getErrorMessage(error, 'Не удалось сохранить billing-данные'))
		} finally {
			saving.value = false
		}
	}
</script>

<template>
	<form class="space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4" @submit.prevent="save">
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
			<TextField
				v-model.trim="form.billing_first_name"
				label="Имя"
				name="billing_first_name"
				:error-message="validationErrors.billing_first_name"
				@update:model-value="clearFieldError('billing_first_name')"
			/>
			<TextField
				v-model.trim="form.billing_last_name"
				label="Фамилия"
				name="billing_last_name"
				:error-message="validationErrors.billing_last_name"
				@update:model-value="clearFieldError('billing_last_name')"
			/>
			<TextField
				v-model.trim="form.billing_email"
				label="Email"
				name="billing_email"
				type="email"
				:error-message="validationErrors.billing_email"
				@update:model-value="clearFieldError('billing_email')"
			/>
			<TextField
				v-model.trim="form.billing_phone"
				label="Телефон"
				name="billing_phone"
				:error-message="validationErrors.billing_phone"
				@update:model-value="clearFieldError('billing_phone')"
			/>
			<TextField
				v-model.trim="form.billing_company"
				label="Компания"
				name="billing_company"
				:error-message="validationErrors.billing_company"
				@update:model-value="clearFieldError('billing_company')"
			/>
			<TextField
				v-model.trim="form.billing_address"
				label="Адрес"
				name="billing_address"
				:error-message="validationErrors.billing_address"
				@update:model-value="clearFieldError('billing_address')"
			/>
			<TextField
				v-model.trim="form.billing_city"
				label="Город"
				name="billing_city"
				:error-message="validationErrors.billing_city"
				@update:model-value="clearFieldError('billing_city')"
			/>
			<TextField
				v-model.trim="form.billing_district"
				label="Район"
				name="billing_district"
				:error-message="validationErrors.billing_district"
				@update:model-value="clearFieldError('billing_district')"
			/>
			<TextField
				v-model.trim="form.billing_postal_code"
				label="Индекс"
				name="billing_postal_code"
				:error-message="validationErrors.billing_postal_code"
				@update:model-value="clearFieldError('billing_postal_code')"
			/>
			<TextField
				v-model.trim="form.billing_country"
				label="Страна"
				name="billing_country"
				:error-message="validationErrors.billing_country"
				@update:model-value="clearFieldError('billing_country')"
			/>
			<TextField
				v-model.trim="form.billing_tax_number"
				label="ИНН"
				name="billing_tax_number"
				:error-message="validationErrors.billing_tax_number"
				@update:model-value="clearFieldError('billing_tax_number')"
			/>
			<TextField
				v-model.trim="form.billing_tax_office"
				label="Налоговая"
				name="billing_tax_office"
				:error-message="validationErrors.billing_tax_office"
				@update:model-value="clearFieldError('billing_tax_office')"
			/>
		</div>

		<div class="flex justify-end">
			<Button type="submit" size="sm" :disabled="saving">
				{{ saving ? 'Сохранение...' : 'Сохранить' }}
			</Button>
		</div>
	</form>
</template>
