<script setup lang="ts">
	import { reactive, ref, watch } from 'vue'
	import { toast } from 'vue3-toastify'

	import Modal from '@/components/profile/Modal.vue'
	import Button from '@/shared/ui/Button.vue'
	import CheckboxField from '@/shared/ui/CheckboxField.vue'
	import SingleImageUpload from '@/shared/ui/SingleImageUpload.vue'
	import TextField from '@/shared/ui/TextField.vue'

	import { mediaApi } from '@/shared/api/media'
	import { getFirstBackendValidationMessage } from '@/shared/api/validation'
	import { canvasEffectsApi } from '../api/canvas-effects'
	import type { CanvasEffect } from '../types/canvas-effect'

	const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()
	const props = defineProps<{ open: boolean; effect: CanvasEffect | null }>()

	const saving = ref(false)

	const form = reactive({
		id: null as number | null,
		name: '',
		image: '',
		image_url: '',
		sort_order: 0 as number | string,
		is_active: true
	})

	const fieldErrors = reactive({
		name: '',
		sort_order: '',
		image: ''
	})

	const resetLocalForm = () => {
		Object.assign(form, {
			id: null,
			name: '',
			image: '',
			image_url: '',
			sort_order: 0,
			is_active: true
		})
		fieldErrors.name = ''
		fieldErrors.sort_order = ''
		fieldErrors.image = ''
	}

	const validate = () => {
		fieldErrors.name = ''
		fieldErrors.sort_order = ''
		fieldErrors.image = ''

		let ok = true
		if (!form.name.trim()) {
			fieldErrors.name = 'Укажите название'
			ok = false
		}
		const sortOrder = Number(form.sort_order)
		if (!Number.isFinite(sortOrder) || sortOrder < 0) {
			fieldErrors.sort_order = 'Укажите корректный порядок'
			ok = false
		}
		return ok
	}

	watch(
		() => [props.open, props.effect] as const,
		([open, effect]) => {
			if (!open) return
			if (!effect) {
				resetLocalForm()
				return
			}
			Object.assign(form, {
				id: effect.id ?? null,
				name: effect.name ?? '',
				image: effect.image_url ?? effect.image ?? '',
				sort_order: effect.sort_order ?? 0,
				is_active: !!effect.is_active
			})
			fieldErrors.name = ''
			fieldErrors.sort_order = ''
			fieldErrors.image = ''
		},
		{ immediate: true }
	)

	const onSubmit = async () => {
		if (!validate()) return
		saving.value = true
		try {
			const payload: CanvasEffect = {
				id: form.id ?? null,
				name: form.name.trim(),
				image: form.image || form.image_url || '',
				sort_order: Number(form.sort_order) || 0,
				is_active: !!form.is_active
			}

			if (payload.id) await canvasEffectsApi.updateCanvasEffect(payload)
			else await canvasEffectsApi.createCanvasEffect(payload)

			emit('saved')
			emit('close')
			if (!props.effect) resetLocalForm()
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
						{{ effect ? 'Редактировать эффект' : 'Добавить эффект' }}
					</h3>
					<p class="mt-1 text-sm text-gray-600">Заполните поля и сохраните.</p>
				</div>
				<Button type="button" variant="ghost" size="icon" :on-click="() => $emit('close')" aria-label="Close">✕</Button>
			</div>

			<form class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2" @submit.prevent="onSubmit">
				<div class="md:col-span-1">
					<TextField
						v-model="form.name"
						label="Название"
						required
						name="name"
						placeholder="Название"
						:error-message="fieldErrors.name"
					/>
				</div>

				<div class="md:col-span-1">
					<TextField
						v-model.number="form.sort_order"
						label="Порядок"
						required
						name="sort_order"
						type="number"
						min="0"
						:error-message="fieldErrors.sort_order"
					/>
				</div>

				<div class="md:col-span-2">
					<SingleImageUpload
						v-model="form.image"
						label="Изображение"
						description="Необязательно. Файл будет загружен сразу, в форму сохранится URL."
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
