<script setup lang="ts">
	import { toTypedSchema } from '@vee-validate/zod'
	import { useForm } from 'vee-validate'
import { ref, watch } from 'vue'
	import { toast } from 'vue3-toastify'
	import { z } from 'zod'

	import Modal from '@/components/profile/Modal.vue'
	import Button from '@/shared/ui/Button.vue'
	import CheckboxField from '@/shared/ui/CheckboxField.vue'
	import SelectField from '@/shared/ui/SelectField.vue'
	import TextField from '@/shared/ui/TextField.vue'

	import { getFirstBackendValidationMessage } from '@/shared/api/validation'
	import { canvasSizesApi } from '../api/canvas-sizes'
	import { CANVAS_SIZE_UNIT_OPTIONS } from '../helpers'
	import type { CanvasSize } from '../types/canvas-size'

	const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()

	const props = defineProps<{ open: boolean; canvasSize: CanvasSize | null }>()

	const saving = ref(false)

	const { errors, defineField, handleSubmit, resetForm, setValues } = useForm({
		initialValues: {
			id: null as number | null,
			width: 0,
			height: 0,
			unit: 'cm',
			is_active: true,
			sort_order: 0
		},
		validationSchema: toTypedSchema(
			z.object({
				id: z.number().nullable().optional(),
				width: z.coerce.number().positive('Укажите ширину'),
				height: z.coerce.number().positive('Укажите высоту'),
				unit: z.string().trim().min(1, 'Выберите единицу'),
				is_active: z.boolean(),
				sort_order: z.coerce.number().min(0, 'Укажите корректный порядок')
			})
		)
	})

	const [width, widthProps] = defineField('width')
	const [height, heightProps] = defineField('height')
	const [unit, unitProps] = defineField('unit')
	const [sortOrder, sortOrderProps] = defineField('sort_order')
	const [isActive] = defineField('is_active')

	const resetLocalForm = () => {
		resetForm({ values: { id: null, width: 0, height: 0, unit: 'cm', is_active: true, sort_order: 0 } })
	}

	watch(
		() => [props.open, props.canvasSize] as const,
		([open, canvasSize]) => {
			if (!open) return
			if (!canvasSize) {
				resetLocalForm()
				return
			}

			setValues({
				id: canvasSize.id ?? null,
				width: canvasSize.width ?? 0,
				height: canvasSize.height ?? 0,
				unit: canvasSize.unit ?? 'cm',
				is_active: !!canvasSize.is_active,
				sort_order: canvasSize.sort_order ?? 0
			})
		},
		{ immediate: true }
	)

	const onSubmit = handleSubmit(async (values) => {
		saving.value = true
		try {
			const payload: CanvasSize = {
				id: values.id ?? null,
				width: values.width,
				height: values.height,
				unit: values.unit,
				is_active: !!values.is_active,
				sort_order: values.sort_order ?? 0
			}

			if (payload.id) {
				await canvasSizesApi.updateCanvasSize(payload)
			} else {
				await canvasSizesApi.createCanvasSize(payload)
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
	})
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
						v-model="(width as any)"
						v-bind="widthProps"
						label="Ширина *"
						name="width"
						type="number"
						min="0"
						:error-message="errors.width"
					/>
				</div>

				<div class="md:col-span-1">
					<TextField
						v-model="(height as any)"
						v-bind="heightProps"
						label="Высота *"
						name="height"
						type="number"
						min="0"
						:error-message="errors.height"
					/>
				</div>

				<div class="md:col-span-1">
					<SelectField
						v-model="unit"
						v-bind="unitProps"
						label="Единица *"
						name="unit"
						placeholder="Выберите единицу"
						:options="CANVAS_SIZE_UNIT_OPTIONS"
						:error-message="errors.unit"
					/>
				</div>

				<div class="md:col-span-1">
					<TextField
						v-model="(sortOrder as any)"
						v-bind="sortOrderProps"
						label="Порядок"
						name="sort_order"
						type="number"
						min="0"
						:error-message="errors.sort_order"
					/>
				</div>

				<CheckboxField v-model="(isActive as any)" label="Активно" name="is_active" class="md:col-span-2" />

				<div class="mt-2 flex items-center justify-end gap-3 md:col-span-2">
					<Button type="button" variant="outline" size="sm" @click="$emit('close')"> Отмена </Button>
					<Button
						type="submit"
						size="sm"
						:disabled="saving || Object.values(errors).some(Boolean)"
						:loading="saving"
					>
						{{ saving ? 'Сохранение...' : 'Сохранить' }}
					</Button>
				</div>
			</form>
		</div>
	</Modal>
</template>
