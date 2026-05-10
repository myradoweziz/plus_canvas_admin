<script setup lang="ts">
	import { reactive, ref, watch } from 'vue'
	import { toast } from 'vue3-toastify'

	import Modal from '@/components/profile/Modal.vue'
	import Button from '@/shared/ui/Button.vue'
	import CheckboxField from '@/shared/ui/CheckboxField.vue'
	import ImageUpload from '@/shared/ui/ImageUpload.vue'
	import TextField from '@/shared/ui/TextField.vue'
	import TextareaField from '@/shared/ui/TextareaField.vue'

	import { getFirstBackendValidationMessage } from '@/shared/api/validation'
	import { discountsApi } from '../api/discounts'
	import type { Discount } from '../types/discount'

	const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()

	const props = defineProps<{ open: boolean; discount: Discount | null }>()

	const saving = ref(false)

	const form = reactive({
		id: null as number | null,
		title: '',
		description: '',
		image_url: '',
		is_active: false,
		order: 0 as number | string,
		image: null as File | null
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
			image_url: '',
			is_active: false,
			order: 0,
			image: null
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
		if (!form.id && !form.image && !form.image_url) {
			fieldErrors.image = 'Выберите изображение'
			ok = false
		}
		return ok
	}

	watch(
		() => [props.open, props.discount] as const,
		([open, discount]) => {
			if (!open) return
			if (!discount) {
				resetLocalForm()
				return
			}

			Object.assign(form, {
				id: discount.id ?? null,
				title: discount.title ?? '',
				description: discount.description ?? '',
				image_url: discount.image_url ?? '',
				is_active: !!discount.is_active,
				order: discount.order ?? 0,
				image: null
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
			const payload: Discount = {
				id: form.id ?? null,
				title: form.title.trim(),
				description: form.description?.trim?.() ? form.description.trim() : form.description ?? '',
				is_active: !!form.is_active,
				order: Number(form.order) || 0,
				image: form.image ?? null
			}

			if (payload.id) {
				await discountsApi.updateDiscount(payload)
			} else {
				await discountsApi.createDiscount(payload)
			}

			emit('saved')
			emit('close')

			if (!props.discount) {
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
						{{ discount ? 'Редактировать скидку' : 'Добавить скидку' }}
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
						label="Заголовок *"
						name="title"
						placeholder="Заголовок"
						:error-message="fieldErrors.title"
					/>
				</div>

				<div class="md:col-span-1">
					<TextField
						v-model.number="form.order"
						label="Порядок"
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
					<ImageUpload
						:model-value="form.image"
						:current-url="form.image_url || ''"
						:error-message="fieldErrors.image"
						@update:model-value="(v) => (form.image = v)"
					/>
				</div>

				<CheckboxField
					v-model="form.is_active"
					label="Активно"
					name="is_active"
					class="md:col-span-2"
				/>

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
