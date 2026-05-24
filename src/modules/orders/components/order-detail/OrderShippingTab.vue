<script setup lang="ts">
	import { computed, ref, watch } from 'vue'
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

	const emptyShippingForm = () => ({
		first_name: '',
		last_name: '',
		email: '',
		phone: '',
		company: '',
		address: '',
		city: '',
		district: '',
		postal_code: '',
		country: '',
		shipping_method: ''
	})

	const form = ref(emptyShippingForm())

	const googleMapsUrl = computed(() => props.order.google_maps_url?.trim() || '')

	const toString = (value: string | null | undefined) => value ?? ''

	const syncForm = (order: Order) => {
		form.value = {
			first_name: toString(order.first_name),
			last_name: toString(order.last_name),
			email: toString(order.email),
			phone: toString(order.phone),
			company: toString(order.company),
			address: toString(order.address),
			city: toString(order.city),
			district: toString(order.district),
			postal_code: toString(order.postal_code),
			country: toString(order.country),
			shipping_method: toString(order.shipping_method)
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
			const updated = await api.updateOrderShippingAddress(props.order.id, { ...form.value })
			emit('saved', updated)
			toast.success('Адрес доставки обновлён')
		} catch (error) {
			setValidationErrors(getValidationErrors(error))
			toast.error(getErrorMessage(error, 'Не удалось сохранить адрес доставки'))
		} finally {
			saving.value = false
		}
	}
</script>

<template>
	<form class="space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4" @submit.prevent="save">
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
			<TextField
				v-model.trim="form.first_name"
				label="Имя"
				name="first_name"
				:error-message="validationErrors.first_name"
				@update:model-value="clearFieldError('first_name')"
			/>
			<TextField
				v-model.trim="form.last_name"
				label="Фамилия"
				name="last_name"
				:error-message="validationErrors.last_name"
				@update:model-value="clearFieldError('last_name')"
			/>
			<TextField
				v-model.trim="form.email"
				label="Email"
				name="email"
				type="email"
				:error-message="validationErrors.email"
				@update:model-value="clearFieldError('email')"
			/>
			<TextField
				v-model.trim="form.phone"
				label="Телефон"
				name="phone"
				:error-message="validationErrors.phone"
				@update:model-value="clearFieldError('phone')"
			/>
			<TextField
				v-model.trim="form.company"
				label="Компания"
				name="company"
				:error-message="validationErrors.company"
				@update:model-value="clearFieldError('company')"
			/>
			<TextField
				v-model.trim="form.address"
				label="Адрес"
				name="address"
				:error-message="validationErrors.address"
				@update:model-value="clearFieldError('address')"
			/>
			<TextField
				v-model.trim="form.city"
				label="Город"
				name="city"
				:error-message="validationErrors.city"
				@update:model-value="clearFieldError('city')"
			/>
			<TextField
				v-model.trim="form.district"
				label="Район"
				name="district"
				:error-message="validationErrors.district"
				@update:model-value="clearFieldError('district')"
			/>
			<TextField
				v-model.trim="form.postal_code"
				label="Индекс"
				name="postal_code"
				:error-message="validationErrors.postal_code"
				@update:model-value="clearFieldError('postal_code')"
			/>
			<TextField
				v-model.trim="form.country"
				label="Страна"
				name="country"
				:error-message="validationErrors.country"
				@update:model-value="clearFieldError('country')"
			/>
			<TextField
				v-model.trim="form.shipping_method"
				label="Способ доставки"
				name="shipping_method"
				:error-message="validationErrors.shipping_method"
				@update:model-value="clearFieldError('shipping_method')"
			/>
		</div>

		<div class="rounded-lg border border-gray-200 bg-white px-4 py-3">
			<p class="text-sm font-medium text-gray-700">Google Maps</p>
			<a
				v-if="googleMapsUrl"
				:href="googleMapsUrl"
				target="_blank"
				rel="noopener noreferrer"
				class="mt-1 inline-block text-sm text-blue-600 hover:underline"
			>
				Открыть на карте
			</a>
			<p v-else class="mt-1 text-sm text-gray-500">—</p>
		</div>

		<div class="flex justify-end">
			<Button type="submit" size="sm" :disabled="saving">
				{{ saving ? 'Сохранение...' : 'Сохранить' }}
			</Button>
		</div>
	</form>
</template>
