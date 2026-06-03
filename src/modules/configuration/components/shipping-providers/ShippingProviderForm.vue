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
	import type { ShippingProvider } from '../../types'

	const route = useRoute()
	const router = useRouter()

	const providerId = computed(() => {
		const id = Number(route.params.id)
		return Number.isFinite(id) ? id : null
	})

	const isEditMode = computed(() => providerId.value != null)
	const pageTitle = computed(() =>
		isEditMode.value ? 'Редактировать провайдера доставки' : 'Добавить провайдера доставки'
	)

	const loading = ref(false)
	const saving = ref(false)

	const form = reactive({
		id: null as number | null,
		friendly_name: '',
		system_name: '',
		logo_path: '',
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

	const loadProvider = async () => {
		if (!providerId.value) return

		loading.value = true
		try {
			const provider = await api.getShippingProviderById(providerId.value)
			Object.assign(form, {
				id: provider.id ?? null,
				friendly_name: provider.friendly_name ?? '',
				system_name: provider.system_name ?? '',
				logo_path: provider.logo_path ?? '',
				display_order: Number(provider.display_order) || 0,
				is_active: !!provider.is_active
			})
		} finally {
			loading.value = false
		}
	}

	onMounted(async () => {
		if (providerId.value) {
			await loadProvider()
		} else {
			resetForm()
		}
	})

	const goBack = () => router.push('/admin-panel/configuration/shipping-providers')

	const onSubmit = async () => {
		if (!validate()) return

		saving.value = true
		try {
			const payload: ShippingProvider = {
				id: isEditMode.value ? providerId.value : null,
				friendly_name: form.friendly_name.trim(),
				system_name: form.system_name.trim(),
				logo_path: form.logo_path.trim(),
				display_order: Number(form.display_order) || 0,
				is_active: !!form.is_active
			}

			if (isEditMode.value) {
				await api.updateShippingProvider(payload)
				toast.success('Провайдер обновлён')
			} else {
				await api.createShippingProvider(payload)
				toast.success('Провайдер добавлен')
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
					placeholder="Например, DHL"
					:error-message="fieldErrors.friendly_name"
					:disabled="loading"
				/>

				<TextField
					v-model="form.system_name"
					label="System name"
					required
					name="system_name"
					placeholder="dhl"
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
