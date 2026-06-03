<script setup lang="ts">
	import { computed, onMounted, reactive, ref } from 'vue'
	import { useRoute, useRouter } from 'vue-router'
	import { toast } from 'vue3-toastify'

	import Button from '@/shared/ui/Button.vue'
	import TextField from '@/shared/ui/TextField.vue'

	import { getFirstBackendValidationMessage } from '@/shared/api/validation'
	import { api } from '../../api'
	import type { DeliveryDate } from '../../types'

	const route = useRoute()
	const router = useRouter()

	const itemId = computed(() => {
		const id = Number(route.params.id)
		return Number.isFinite(id) ? id : null
	})

	const isEditMode = computed(() => itemId.value != null)
	const pageTitle = computed(() => (isEditMode.value ? 'Редактировать срок доставки' : 'Добавить срок доставки'))

	const loading = ref(false)
	const saving = ref(false)

	const form = reactive({
		id: null as number | null,
		name: '',
		display_order: 0
	})

	const fieldErrors = reactive({
		name: ''
	})

	const resetForm = () => {
		Object.assign(form, {
			id: null,
			name: '',
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

	const loadItem = async () => {
		if (!itemId.value) return

		loading.value = true
		try {
			const item = await api.getDeliveryDateById(itemId.value)
			Object.assign(form, {
				id: item.id ?? null,
				name: item.name ?? '',
				display_order: Number(item.display_order) || 0
			})
		} finally {
			loading.value = false
		}
	}

	onMounted(async () => {
		if (itemId.value) {
			await loadItem()
		} else {
			resetForm()
		}
	})

	const goBack = () => router.push('/admin-panel/configuration/delivery-times')

	const onSubmit = async () => {
		if (!validate()) return

		saving.value = true
		try {
			const payload: DeliveryDate = {
				id: isEditMode.value ? itemId.value : null,
				name: form.name.trim(),
				display_order: Number(form.display_order) || 0
			}

			if (isEditMode.value) {
				await api.updateDeliveryDate(payload)
				toast.success('Срок доставки обновлён')
			} else {
				await api.createDeliveryDate(payload)
				toast.success('Срок доставки добавлен')
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
					label="Название"
					required
					name="name"
					placeholder="Например, 3–5 рабочих дней"
					:error-message="fieldErrors.name"
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
