<script setup lang="ts">
	import { reactive, ref, watch } from 'vue'
	import { toast } from 'vue3-toastify'

	import Modal from '@/components/profile/Modal.vue'
	import Button from '@/shared/ui/Button.vue'
	import CheckboxField from '@/shared/ui/CheckboxField.vue'
	import SingleImageUpload from '@/shared/ui/SingleImageUpload.vue'
	import TextField from '@/shared/ui/TextField.vue'
	import TextareaField from '@/shared/ui/TextareaField.vue'

	import { mediaApi } from '@/shared/api/media'
	import { getFirstBackendValidationMessage } from '@/shared/api/validation'
	import { api as stocksApi } from '../api'
	import type { Stock } from '../types'

	const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()

	const props = defineProps<{ open: boolean; stock: Stock | null }>()

	const saving = ref(false)

	const form = reactive({
		id: null as number | null,
		title: '',
		description: '',
		image: '',
		image_url: '',
		is_active: false,
		order: 0 as number | string
	})

	const fieldErrors = reactive({
		title: '',
		description: '',
		order: '',
		image: ''
	})

	const resetLocalForm = () => {
		Object.assign(form, {
			id: null,
			title: '',
			description: '',
			image: '',
			image_url: '',
			is_active: false,
			order: 0
		})
		fieldErrors.title = ''
		fieldErrors.description = ''
		fieldErrors.order = ''
		fieldErrors.image = ''
	}

	const validate = () => {
		fieldErrors.title = ''
		fieldErrors.description = ''
		fieldErrors.order = ''
		fieldErrors.image = ''

		let ok = true
		if (!form.title.trim()) {
			fieldErrors.title = 'Укажите заголовок'
			ok = false
		}
		const order = Number(form.order)
		if (!Number.isFinite(order) || order < 0) {
			fieldErrors.order = 'Укажите корректный порядок'
			ok = false
		}
		if (!form.id && !form.image) {
			fieldErrors.image = 'Выберите изображение'
			ok = false
		}
		return ok
	}

	watch(
		() => [props.open, props.stock] as const,
		([open, stock]) => {
			if (!open) return
			if (!stock) {
				resetLocalForm()
				return
			}

			Object.assign(form, {
				id: stock.id ?? null,
				title: stock.title ?? '',
				description: stock.description ?? '',
				image: stock.image_url ?? '',
				is_active: !!stock.is_active,
				order: stock.order ?? 0
			})
			fieldErrors.title = ''
			fieldErrors.description = ''
			fieldErrors.order = ''
			fieldErrors.image = ''
		},
		{ immediate: true }
	)

	const onSubmit = async () => {
		if (!validate()) return

		saving.value = true
		try {
			const payload: Stock = {
				id: form.id ?? null,
				title: form.title.trim(),
				description: form.description?.trim?.() ? form.description.trim() : (form.description ?? ''),
				image: form.image || form.image_url || '',
				is_active: !!form.is_active,
				order: Number(form.order) || 0
			}

			if (payload.id) {
				await stocksApi.updateStock(payload)
			} else {
				await stocksApi.createStock(payload)
			}

			emit('saved')
			emit('close')

			if (!props.stock) {
				resetLocalForm()
			}
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
	<Modal v-if="open" @close="$emit('close')">
		<div class="relative z-100000 mx-auto w-[92vw] max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
			<div class="flex items-start justify-between gap-4">
				<div class="min-w-0">
					<h3 class="text-lg font-semibold text-gray-900">
						{{ stock ? 'Редактировать акцию' : 'Добавить акцию' }}
					</h3>
					<p class="mt-1 text-sm text-gray-600">Заполните поля и сохраните.</p>
				</div>
				<Button type="button" variant="ghost" size="icon" :on-click="() => $emit('close')" aria-label="Close">
					✕
				</Button>
			</div>

			<form class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2" @submit.prevent="onSubmit">
				<div class="md:col-span-1">
					<TextField
						v-model="form.title"
						label="Заголовок"
						required
						name="title"
						placeholder="Заголовок"
						:error-message="fieldErrors.title"
					/>
				</div>

				<div class="md:col-span-1">
					<TextField
						v-model.number="form.order"
						label="Порядок"
						required
						name="order"
						type="number"
						min="0"
						:error-message="fieldErrors.order"
					/>
				</div>

				<div class="md:col-span-2">
					<TextareaField
						v-model="form.description"
						label="Описание"
						name="description"
						:error-message="fieldErrors.description"
					/>
				</div>

				<div class="md:col-span-2">
					<SingleImageUpload
						v-model="form.image"
						label="Изображение"
						:required="!form.id"
						:error-message="fieldErrors.image"
						:uploader="mediaApi.uploadImages"
					/>
				</div>

				<CheckboxField v-model="form.is_active" label="Активно" name="is_active" class="md:col-span-2" />

				<div class="mt-2 flex items-center justify-end gap-3 md:col-span-2">
					<Button type="button" variant="outline" size="sm" @click="$emit('close')"> Отмена </Button>
					<Button type="submit" size="sm" :disabled="saving" :loading="saving">
						{{ saving ? 'Сохранение...' : 'Сохранить' }}
					</Button>
				</div>
			</form>
		</div>
	</Modal>
</template>
