<script setup lang="ts">
	import { computed, onMounted, reactive, ref } from 'vue'
	import { useRoute, useRouter } from 'vue-router'
	import { toast } from 'vue3-toastify'

	import Button from '@/shared/ui/Button.vue'
	import TextareaField from '@/shared/ui/TextareaField.vue'
	import TextField from '@/shared/ui/TextField.vue'

	import { getFirstBackendValidationMessage } from '@/shared/api/validation'
	import { api } from '../api'
	import type { ShippingMethod } from '../types'

	const route = useRoute()
	const router = useRouter()

	const methodId = computed(() => {
		const id = Number(route.params.id)
		return Number.isFinite(id) ? id : null
	})

	const isEditMode = computed(() => methodId.value != null)
	const pageTitle = computed(() =>
		isEditMode.value ? 'Редактировать способ доставки' : 'Добавить способ доставки'
	)

	const loading = ref(false)
	const saving = ref(false)

	const form = reactive({
		id: null as number | null,
		name: '',
		description: '',
		display_order: 0
	})

	const fieldErrors = reactive({
		name: ''
	})

	const resetForm = () => {
		Object.assign(form, {
			id: null,
			name: '',
			description: '',
			display_order: 0
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
		return ok
	}

	const loadMethod = async () => {
		if (!methodId.value) return

		loading.value = true
		try {
			const method = await api.getShippingMethodById(methodId.value)
			Object.assign(form, {
				id: method.id ?? null,
				name: method.name ?? '',
				description: method.description ?? '',
				display_order: Number(method.display_order) || 0
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

	const goBack = () => router.push('/admin-panel/configuration/shipping-methods')

	const onSubmit = async () => {
		if (!validate()) return

		saving.value = true
		try {
			const payload: ShippingMethod = {
				id: isEditMode.value ? methodId.value : null,
				name: form.name.trim(),
				description: form.description.trim(),
				display_order: Number(form.display_order) || 0
			}

			if (isEditMode.value) {
				await api.updateShippingMethod(payload)
				toast.success('Способ доставки обновлён')
			} else {
				await api.createShippingMethod(payload)
				toast.success('Способ доставки добавлен')
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

				<TextareaField
					v-model="form.description"
					class="md:col-span-2"
					label="Description"
					name="description"
					placeholder="Описание"
					:disabled="loading"
				/>

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
