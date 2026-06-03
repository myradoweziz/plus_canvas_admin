<script setup lang="ts">
	import { computed, onMounted, reactive, ref, watch } from 'vue'
	import { useRoute, useRouter } from 'vue-router'
	import { toast } from 'vue3-toastify'

	import Button from '@/shared/ui/Button.vue'
	import CheckboxField from '@/shared/ui/CheckboxField.vue'
	import TextareaField from '@/shared/ui/TextareaField.vue'
	import TextField from '@/shared/ui/TextField.vue'

	import { getFirstBackendValidationMessage } from '@/shared/api/validation'
	import { api } from '../api'
	import type { Store } from '../types'

	const route = useRoute()
	const router = useRouter()

	const storeId = computed(() => {
		const id = Number(route.params.id)
		return Number.isFinite(id) ? id : null
	})

	const isEditMode = computed(() => storeId.value != null)
	const pageTitle = computed(() => (isEditMode.value ? 'Редактировать магазин' : 'Добавить магазин'))

	const loading = ref(false)
	const saving = ref(false)

	const form = reactive({
		id: null as number | null,
		name: '',
		url: '',
		ssl_enabled: true,
		secure_url: '',
		hosts: '',
		display_order: 0,
		company_name: '',
		company_address: '',
		company_phone: '',
		company_vat: ''
	})

	const fieldErrors = reactive({
		name: '',
		url: '',
		secure_url: ''
	})

	const resetForm = () => {
		Object.assign(form, {
			id: null,
			name: '',
			url: '',
			ssl_enabled: true,
			secure_url: '',
			hosts: '',
			display_order: 0,
			company_name: '',
			company_address: '',
			company_phone: '',
			company_vat: ''
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
		if (!form.name.trim()) {
			fieldErrors.name = 'Укажите название'
			ok = false
		}
		if (!form.url.trim()) {
			fieldErrors.url = 'Укажите url'
			ok = false
		}
		if (form.ssl_enabled && !form.secure_url.trim()) {
			fieldErrors.secure_url = 'Укажите secure_url'
			ok = false
		}
		return ok
	}

	watch(
		() => form.ssl_enabled,
		(value) => {
			if (!value) {
				form.secure_url = ''
				fieldErrors.secure_url = ''
			}
		}
	)

	const loadStore = async () => {
		if (!storeId.value) return

		loading.value = true
		try {
			const store = await api.getStoreById(storeId.value)
			Object.assign(form, {
				id: store.id ?? null,
				name: store.name ?? '',
				url: store.url ?? '',
				ssl_enabled: !!store.ssl_enabled,
				secure_url: store.secure_url ?? '',
				hosts: store.hosts ?? '',
				display_order: Number(store.display_order) || 0,
				company_name: store.company_name ?? '',
				company_address: store.company_address ?? '',
				company_phone: store.company_phone ?? '',
				company_vat: store.company_vat ?? ''
			})
		} finally {
			loading.value = false
		}
	}

	onMounted(async () => {
		if (storeId.value) {
			await loadStore()
		} else {
			resetForm()
		}
	})

	const goBack = () => router.push('/admin-panel/configuration/stores')

	const onSubmit = async () => {
		if (!validate()) return

		saving.value = true
		try {
			const payload: Store = {
				id: isEditMode.value ? storeId.value : null,
				name: form.name.trim(),
				url: form.url.trim(),
				ssl_enabled: !!form.ssl_enabled,
				secure_url: form.ssl_enabled ? form.secure_url.trim() : '',
				hosts: form.hosts.trim(),
				display_order: Number(form.display_order) || 0,
				company_name: form.company_name.trim(),
				company_address: form.company_address.trim(),
				company_phone: form.company_phone.trim(),
				company_vat: form.company_vat.trim()
			}

			if (isEditMode.value) {
				await api.updateStore(payload)
				toast.success('Магазин обновлён')
			} else {
				await api.createStore(payload)
				toast.success('Магазин добавлен')
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
					v-model="form.name"
					label="Name"
					required
					name="name"
					placeholder="Name"
					:error-message="fieldErrors.name"
					:disabled="loading"
				/>

				<TextField
					v-model.number="form.display_order"
					label="Display order"
					name="display_order"
					type="number"
					min="0"
					step="1"
					:disabled="loading"
				/>

				<TextField
					v-model="form.url"
					class="md:col-span-2"
					label="URL"
					required
					name="url"
					placeholder="https://example.com"
					:error-message="fieldErrors.url"
					:disabled="loading"
				/>

				<CheckboxField v-model="form.ssl_enabled" label="SSL enabled" name="ssl_enabled" :disabled="loading" />

				<TextField
					v-model="form.secure_url"
					label="Secure URL"
					name="secure_url"
					:disabled="loading || !form.ssl_enabled"
					:required="form.ssl_enabled"
					placeholder="https://secure.example.com"
					:error-message="fieldErrors.secure_url"
				/>

				<TextareaField
					v-model="form.hosts"
					class="md:col-span-2"
					label="Hosts"
					name="hosts"
					placeholder="host1, host2"
					:disabled="loading"
				/>

				<TextField
					v-model="form.company_name"
					class="md:col-span-2"
					label="Company name"
					name="company_name"
					:disabled="loading"
				/>
				<TextareaField
					v-model="form.company_address"
					class="md:col-span-2"
					label="Company address"
					name="company_address"
					:disabled="loading"
				/>
				<TextField v-model="form.company_phone" label="Company phone" name="company_phone" :disabled="loading" />
				<TextField v-model="form.company_vat" label="Company VAT" name="company_vat" :disabled="loading" />

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
