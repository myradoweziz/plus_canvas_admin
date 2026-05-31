<script setup lang="ts">
	import { reactive, ref, watch } from 'vue'
	import { toast } from 'vue3-toastify'

	import Modal from '@/components/profile/Modal.vue'
	import Button from '@/shared/ui/Button.vue'
	import CheckboxField from '@/shared/ui/CheckboxField.vue'
	import TextField from '@/shared/ui/TextField.vue'

	import { TurkishLiraIcon } from '@/shared/icons'
	import { getFirstBackendValidationMessage } from '@/shared/api/validation'
	import { api } from '../api'
	import { CANVAS_SIZE_DEFAULT_UNIT } from '../helpers'
	import type { CanvasSize } from '../types'

	const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()

	const props = defineProps<{ open: boolean; canvasSize: CanvasSize | null }>()

	const saving = ref(false)

	const form = reactive({
		id: null as number | null,
		width: 0 as number | string,
		height: 0 as number | string,
		is_active: true,
		sort_order: 0 as number | string,
		price: 0 as number | string
	})

	const fieldErrors = reactive({
		width: '',
		height: '',
		price: '',
		sort_order: ''
	})

	const resetLocalForm = () => {
		Object.assign(form, { id: null, width: 0, height: 0, is_active: true, sort_order: 0, price: 0 })
		fieldErrors.width = ''
		fieldErrors.height = ''
		fieldErrors.price = ''
		fieldErrors.sort_order = ''
	}

	const validate = () => {
		fieldErrors.width = ''
		fieldErrors.height = ''
		fieldErrors.price = ''
		fieldErrors.sort_order = ''

		let ok = true
		const width = Number(form.width)
		if (!Number.isFinite(width) || width <= 0) {
			fieldErrors.width = 'Укажите ширину'
			ok = false
		}
		const height = Number(form.height)
		if (!Number.isFinite(height) || height <= 0) {
			fieldErrors.height = 'Укажите высоту'
			ok = false
		}
		const sortOrder = Number(form.sort_order)
		if (!Number.isFinite(sortOrder) || sortOrder < 0) {
			fieldErrors.sort_order = 'Укажите корректный порядок'
			ok = false
		}
		const price = Number(form.price)
		if (!Number.isFinite(price) || price < 0) {
			fieldErrors.price = 'Укажите корректную цену'
			ok = false
		}
		return ok
	}

	watch(
		() => [props.open, props.canvasSize] as const,
		([open, canvasSize]) => {
			if (!open) return
			if (!canvasSize) {
				resetLocalForm()
				return
			}

			Object.assign(form, {
				id: canvasSize.id ?? null,
				width: canvasSize.width ?? 0,
				height: canvasSize.height ?? 0,
				is_active: !!canvasSize.is_active,
				sort_order: canvasSize.sort_order ?? 0,
				price: canvasSize.price ?? 0
			})
			fieldErrors.width = ''
			fieldErrors.height = ''
			fieldErrors.price = ''
			fieldErrors.sort_order = ''
		},
		{ immediate: true }
	)

	const onSubmit = async () => {
		if (!validate()) return

		saving.value = true
		try {
			const payload: CanvasSize = {
				id: form.id ?? null,
				width: Number(form.width),
				height: Number(form.height),
				unit: CANVAS_SIZE_DEFAULT_UNIT,
				is_active: !!form.is_active,
				sort_order: Number(form.sort_order) || 0,
				price: Number(form.price) || 0
			}

			if (payload.id) {
				await api.updateCanvasSize(payload)
			} else {
				await api.createCanvasSize(payload)
			}

			emit('saved')
			emit('close')

			if (!props.canvasSize) {
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
						{{ canvasSize ? 'Редактировать размер холста' : 'Добавить размер холста' }}
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
						v-model.number="form.width"
						label="Ширина"
						required
						name="width"
						type="number"
						min="0"
						:error-message="fieldErrors.width"
					/>
				</div>

				<div class="md:col-span-1">
					<TextField
						v-model.number="form.height"
						label="Высота"
						required
						name="height"
						type="number"
						min="0"
						:error-message="fieldErrors.height"
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

				<div class="md:col-span-1">
					<TextField
						v-model.number="form.price"
						label="Цена"
						required
						name="price"
						type="number"
						min="0"
						:append-icon="TurkishLiraIcon"
						:error-message="fieldErrors.price"
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
