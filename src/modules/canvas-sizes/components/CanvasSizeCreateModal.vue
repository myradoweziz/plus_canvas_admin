<script setup lang="ts">
	import { ref, watch } from 'vue'

	import Modal from '@/components/profile/Modal.vue'
	import Button from '@/shared/ui/Button.vue'
	import CheckboxField from '@/shared/ui/CheckboxField.vue'
	import SelectField from '@/shared/ui/SelectField.vue'
	import TextField from '@/shared/ui/TextField.vue'

	import { canvasSizesApi } from '../api/canvas-sizes'
	import { CANVAS_SIZE_UNIT_OPTIONS } from '../helpers'
	import type { CanvasSize } from '../types/canvas-size'

	const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()

	const props = defineProps<{ open: boolean; canvasSize: CanvasSize | null }>()

	const saving = ref(false)

	const form = ref<CanvasSize>({
		id: null,
		width: 0,
		height: 0,
		unit: 'cm',
		is_active: true,
		sort_order: 0
	})

	const resetForm = () => {
		form.value = {
			id: null,
			width: 0,
			height: 0,
			unit: 'cm',
			is_active: true,
			sort_order: 0
		}
	}

	watch(
		() => props.canvasSize,
		(canvasSize) => {
			if (!canvasSize) {
				resetForm()
				return
			}

			form.value = {
				id: canvasSize.id,
				width: canvasSize.width,
				height: canvasSize.height,
				unit: canvasSize.unit,
				is_active: canvasSize.is_active,
				sort_order: canvasSize.sort_order
			}
		},
		{ immediate: true }
	)

	const onSubmit = async () => {
		saving.value = true
		try {
			if (props.canvasSize?.id) {
				await canvasSizesApi.updateCanvasSize(form.value)
			} else {
				await canvasSizesApi.createCanvasSize(form.value)
			}

			emit('saved')
			emit('close')

			if (!props.canvasSize) {
				resetForm()
			}
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
					<TextField v-model.number="form.width" label="Ширина *" name="width" type="number" min="0" />
				</div>

				<div class="md:col-span-1">
					<TextField v-model.number="form.height" label="Высота *" name="height" type="number" min="0" />
				</div>

				<div class="md:col-span-1">
					<SelectField
						v-model="form.unit"
						label="Единица *"
						name="unit"
						placeholder="Выберите единицу"
						:options="CANVAS_SIZE_UNIT_OPTIONS"
					/>
				</div>

				<div class="md:col-span-1">
					<TextField v-model.number="form.sort_order" label="Порядок" name="sort_order" type="number" min="0" />
				</div>

				<CheckboxField v-model="form.is_active" label="Активно" name="is_active" class="md:col-span-2" />

				<div class="mt-2 flex items-center justify-end gap-3 md:col-span-2">
					<Button type="button" variant="outline" size="sm" @click="$emit('close')"> Отмена </Button>
					<Button
						type="submit"
						size="sm"
						:disabled="saving || !form.width || !form.height || !form.unit"
						:loading="saving"
					>
						{{ saving ? 'Сохранение...' : 'Сохранить' }}
					</Button>
				</div>
			</form>
		</div>
	</Modal>
</template>
