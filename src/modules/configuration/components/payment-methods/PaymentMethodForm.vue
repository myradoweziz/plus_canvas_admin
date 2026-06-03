<script setup lang="ts">
	import { computed, onMounted, reactive, ref } from 'vue'
	import { useRoute, useRouter } from 'vue-router'
	import { toast } from 'vue3-toastify'

	import Button from '@/shared/ui/Button.vue'
	import CheckboxField from '@/shared/ui/CheckboxField.vue'
	import SingleImageUpload from '@/shared/ui/SingleImageUpload.vue'
	import TextField from '@/shared/ui/TextField.vue'

	import { mediaApi } from '@/shared/api/media'
	import { getFirstBackendValidationMessage } from '@/shared/api/validation'
	import { api } from '../../api'
	import type { PaymentMethod } from '../../types'

	const route = useRoute()
	const router = useRouter()

	const methodId = computed(() => {
		const id = Number(route.params.id)
		return Number.isFinite(id) ? id : null
	})

	const isEditMode = computed(() => methodId.value != null)
	const pageTitle = computed(() =>
		isEditMode.value ? 'Редактировать способ оплаты' : 'Добавить способ оплаты'
	)

	const loading = ref(false)
	const saving = ref(false)

	const form = reactive({
		id: null as number | null,
		friendly_name: '',
		system_name: '',
		logo_path: '',
		supports_capture: false,
		supports_refund: false,
		supports_partial_refund: false,
		supports_void: false,
		supports_recurring: false,
		display_order: 0,
		is_active: true
	})

	const fieldErrors = reactive({
		friendly_name: '',
		system_name: '',
		logo_path: ''
	})

	const resetForm = () => {
		Object.assign(form, {
			id: null,
			friendly_name: '',
			system_name: '',
			logo_path: '',
			supports_capture: false,
			supports_refund: false,
			supports_partial_refund: false,
			supports_void: false,
			supports_recurring: false,
			display_order: 0,
			is_active: true
		})
		Object.keys(fieldErrors).forEach((key) => {
			fieldErrors[key as keyof typeof fieldErrors] = ''
		})
	}

	const validate = () => {
		Object.keys(fieldErrors).forEach((key) => {
			fieldErrors[key as keyof typeof fieldErrors] = ''
		})

		let ok = true
		if (!form.friendly_name.trim()) {
			fieldErrors.friendly_name = 'Укажите название'
			ok = false
		}
		if (!form.system_name.trim()) {
			fieldErrors.system_name = 'Укажите system name'
			ok = false
		}
		if (!isEditMode.value && !form.logo_path.trim()) {
			fieldErrors.logo_path = 'Выберите логотип'
			ok = false
		}
		return ok
	}

	const loadMethod = async () => {
		if (!methodId.value) return

		loading.value = true
		try {
			const method = await api.getPaymentMethodById(methodId.value)
			Object.assign(form, {
				id: method.id ?? null,
				friendly_name: method.friendly_name ?? '',
				system_name: method.system_name ?? '',
				logo_path: method.logo_path ?? '',
				supports_capture: !!method.supports_capture,
				supports_refund: !!method.supports_refund,
				supports_partial_refund: !!method.supports_partial_refund,
				supports_void: !!method.supports_void,
				supports_recurring: !!method.supports_recurring,
				display_order: Number(method.display_order) || 0,
				is_active: !!method.is_active
			})
		} finally {
			loading.value = false
		}
	}

	onMounted(async () => {
		if (methodId.value) {
			await loadMethod()
		} else {
			resetForm()
		}
	})

	const goBack = () => router.push('/admin-panel/configuration/payment-methods')

	const onSubmit = async () => {
		if (!validate()) return

		saving.value = true
		try {
			const payload: PaymentMethod = {
				id: isEditMode.value ? methodId.value : null,
				friendly_name: form.friendly_name.trim(),
				system_name: form.system_name.trim(),
				logo_path: form.logo_path.trim(),
				supports_capture: !!form.supports_capture,
				supports_refund: !!form.supports_refund,
				supports_partial_refund: !!form.supports_partial_refund,
				supports_void: !!form.supports_void,
				supports_recurring: !!form.supports_recurring,
				display_order: Number(form.display_order) || 0,
				is_active: !!form.is_active
			}

			if (isEditMode.value) {
				await api.updatePaymentMethod(payload)
				toast.success('Способ оплаты обновлён')
			} else {
				await api.createPaymentMethod(payload)
				toast.success('Способ оплаты добавлен')
			}

			goBack()
		} catch (err) {
			const msg = getFirstBackendValidationMessage(err)
			if (msg) toast.error(msg)
			else throw err
		} finally {
			saving.value = false
		}
	}
</script>

<template>
	<div class="space-y-6">
		<div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
			<div class="flex items-start justify-between gap-4">
				<h3 class="text-lg font-semibold text-gray-900">{{ pageTitle }}</h3>

				<Button type="button" variant="outline" size="sm" :on-click="goBack">Назад</Button>
			</div>

			<form class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2" @submit.prevent="onSubmit">
				<TextField
					v-model="form.friendly_name"
					label="Название"
					required
					name="friendly_name"
					placeholder="Например, Visa"
					:error-message="fieldErrors.friendly_name"
					:disabled="loading"
				/>

				<TextField
					v-model="form.system_name"
					label="System name"
					required
					name="system_name"
					placeholder="visa"
					:error-message="fieldErrors.system_name"
					:disabled="loading"
				/>

				<TextField
					v-model.number="form.display_order"
					label="Порядок отображения"
					name="display_order"
					type="number"
					min="0"
					step="1"
					:disabled="loading"
				/>

				<CheckboxField v-model="form.is_active" label="Активен" name="is_active" :disabled="loading" />

				<div class="md:col-span-2 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
					<CheckboxField
						v-model="form.supports_capture"
						label="Capture"
						name="supports_capture"
						:disabled="loading"
					/>
					<CheckboxField v-model="form.supports_refund" label="Refund" name="supports_refund" :disabled="loading" />
					<CheckboxField
						v-model="form.supports_partial_refund"
						label="Partial refund"
						name="supports_partial_refund"
						:disabled="loading"
					/>
					<CheckboxField v-model="form.supports_void" label="Void" name="supports_void" :disabled="loading" />
					<CheckboxField
						v-model="form.supports_recurring"
						label="Recurring"
						name="supports_recurring"
						:disabled="loading"
					/>
				</div>

				<div class="md:col-span-2">
					<SingleImageUpload
						v-model="form.logo_path"
						label="Логотип"
						:required="!isEditMode"
						:current-url="form.logo_path"
						:error-message="fieldErrors.logo_path"
						:uploader="mediaApi.uploadImages"
					/>
				</div>

				<div class="mt-2 flex items-center justify-end gap-3 md:col-span-2">
					<Button type="button" variant="outline" size="sm" :on-click="goBack">Отмена</Button>
					<Button type="submit" size="sm" :disabled="saving || loading" :loading="saving">
						{{ saving ? 'Сохранение...' : 'Сохранить' }}
					</Button>
				</div>
			</form>
		</div>
	</div>
</template>
