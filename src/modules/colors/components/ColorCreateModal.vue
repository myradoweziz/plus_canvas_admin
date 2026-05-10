<script setup lang="ts">
	import { reactive, ref, watch } from 'vue'
	import { toast } from 'vue3-toastify'

	import Modal from '@/components/profile/Modal.vue'
	import Button from '@/shared/ui/Button.vue'
	import CheckboxField from '@/shared/ui/CheckboxField.vue'
	import ColorPicker from '@/shared/ui/ColorPicker.vue'
	import ImageUpload from '@/shared/ui/ImageUpload.vue'
	import TextField from '@/shared/ui/TextField.vue'

	import { getFirstBackendValidationMessage } from '@/shared/api/validation'
	import { colorsApi } from '../api/colors'
	import type { Color } from '../types/color'

	const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()

	const props = defineProps<{ open: boolean; color: Color | null }>()

	const saving = ref(false)
	const imageError = ref('')

	const form = reactive({
		id: null as number | null,
		name: '',
		hex_code: '#000000',
		is_active: false,
		image_url: '',
		image: null as File | null
	})

	const fieldErrors = reactive({
		name: '',
		hex_code: ''
	})

	const onImageUpdate = (file: File | null) => {
		form.image = file
		imageError.value = ''
	}

	const resetLocalForm = () => {
		Object.assign(form, { id: null, name: '', hex_code: '#000000', is_active: false, image_url: '', image: null })
		fieldErrors.name = ''
		fieldErrors.hex_code = ''
		imageError.value = ''
	}

	const validate = () => {
		fieldErrors.name = ''
		fieldErrors.hex_code = ''
		imageError.value = ''

		let ok = true
		if (!form.name.trim()) {
			fieldErrors.name = 'Укажите название'
			ok = false
		}
		if (!/^#[0-9A-Fa-f]{6}$/.test(String(form.hex_code || ''))) {
			fieldErrors.hex_code = 'Укажите корректный цвет'
			ok = false
		}
		if (!form.id && !form.image && !form.image_url) {
			imageError.value = 'Выберите изображение'
			ok = false
		}
		return ok
	}

	watch(
		() => [props.open, props.color] as const,
		([open, color]) => {
			if (!open) return
			if (!color) {
				resetLocalForm()
				return
			}

			Object.assign(form, {
				id: color.id ?? null,
				name: color.name ?? '',
				hex_code: color.hex_code ?? '#000000',
				is_active: !!color.is_active,
				image_url: (color as any).image_url ?? (color as any).image ?? '',
				image: null
			})
			fieldErrors.name = ''
			fieldErrors.hex_code = ''
			imageError.value = ''
		},
		{ immediate: true }
	)

	const onSubmit = async () => {
		if (!validate()) return

		saving.value = true
		try {
			const payload: Color = {
				id: form.id ?? null,
				name: form.name.trim(),
				hex_code: form.hex_code,
				is_active: !!form.is_active,
				image_url: form.image_url || '',
				image: form.image || null
			}

			if (payload.id) {
				await colorsApi.updateColor(payload)
			} else {
				await colorsApi.createColor(payload)
			}

			emit('saved')
			emit('close')

			if (!props.color) {
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
						{{ color ? 'Редактировать цвет' : 'Добавить цвет' }}
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
						v-model="form.name"
						label="Название *"
						name="name"
						placeholder="Название"
						:error-message="fieldErrors.name"
					/>
				</div>

				<div class="md:col-span-1">
					<ColorPicker v-model="form.hex_code" label="Цвет *" name="hex_code" :error-message="fieldErrors.hex_code" />
				</div>

				<div class="md:col-span-2">
					<ImageUpload
						:model-value="form.image"
						:current-url="form.image_url || ''"
						:error-message="imageError"
						@update:model-value="onImageUpdate"
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
