<script setup lang="ts">
	import { computed, onBeforeUnmount, ref, watch } from 'vue'

	import Modal from '@/components/profile/Modal.vue'
	import Button from '@/shared/ui/Button.vue'
	import CheckboxField from '@/shared/ui/CheckboxField.vue'
	import SelectField from '@/shared/ui/SelectField.vue'
	import TextField from '@/shared/ui/TextField.vue'

	import { canvasSizesApi } from '@/modules/canvas-sizes/api/canvas-sizes'
	import type { CanvasSize } from '@/modules/canvas-sizes/types/canvas-size'
	import { slugify } from '@/shared'
	import { canvasFormatsApi } from '../api/canvas-formats'
	import type { CanvasFormat, CanvasFormatSize } from '../types/canvas-format'
	import { getCanvasFormatSizeLabel } from '../types/canvas-format'

	const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()

	const props = defineProps<{ open: boolean; canvasFormat: CanvasFormat | null }>()

	const saving = ref(false)
	const loadingCanvasSizes = ref(false)
	const canvasSizes = ref<CanvasSize[]>([])
	const canvasSizesRequestId = ref(0)
	const selectedCanvasSizeId = ref<number | null>(null)
	const slugManuallyEdited = ref(false)
	const lastGeneratedSlug = ref('')

	const form = ref<CanvasFormat>({
		id: null,
		name: '',
		slug: '',
		is_active: true,
		sort_order: 0,
		sizes: []
	})

	const resetForm = () => {
		form.value = {
			id: null,
			name: '',
			slug: '',
			is_active: true,
			sort_order: 0,
			sizes: []
		}
	}

	watch(
		() => props.canvasFormat,
		(canvasFormat) => {
			if (!canvasFormat) {
				resetForm()
				slugManuallyEdited.value = false
				lastGeneratedSlug.value = ''
				return
			}

			form.value = {
				id: canvasFormat.id,
				name: canvasFormat.name,
				slug: canvasFormat.slug,
				is_active: canvasFormat.is_active,
				sort_order: canvasFormat.sort_order,
				sizes: canvasFormat.sizes.map((size) => ({
					id: size.id,
					sort_order: size.sort_order
				}))
			}
			lastGeneratedSlug.value = slugify(canvasFormat.name)
			slugManuallyEdited.value = Boolean(canvasFormat.slug && canvasFormat.slug !== lastGeneratedSlug.value)
		},
		{ immediate: true }
	)

	watch(
		() => form.value.name,
		(name) => {
			const generatedSlug = slugify(name)

			if (!slugManuallyEdited.value || !form.value.slug || form.value.slug === lastGeneratedSlug.value) {
				form.value.slug = generatedSlug
				slugManuallyEdited.value = false
			}

			lastGeneratedSlug.value = generatedSlug
		}
	)

	const selectedSizeIds = computed(() => new Set(form.value.sizes.map((size) => size.id)))
	const canvasSizeOptions = computed(() =>
		canvasSizes.value
			.filter((canvasSize): canvasSize is CanvasSize & { id: number } => canvasSize.id !== null)
			.filter((canvasSize) => !selectedSizeIds.value.has(canvasSize.id))
			.map((canvasSize) => ({
				label: getCanvasFormatSizeLabel(canvasSize),
				value: canvasSize.id
			}))
	)
	const selectedCanvasSizes = computed(() =>
		form.value.sizes.map((size) => {
			const canvasSize = canvasSizes.value.find((item) => item.id === size.id)

			return {
				...size,
				width: canvasSize?.width ?? size.width,
				height: canvasSize?.height ?? size.height,
				unit: canvasSize?.unit ?? size.unit
			}
		})
	)

	const loadCanvasSizes = async () => {
		const requestId = canvasSizesRequestId.value + 1
		canvasSizesRequestId.value = requestId
		loadingCanvasSizes.value = true
		try {
			const result = await canvasSizesApi.listCanvasSizes({
				limit: 100,
				offset: 0
			})

			if (requestId !== canvasSizesRequestId.value) return
			canvasSizes.value = result.items || []
		} finally {
			if (requestId === canvasSizesRequestId.value) {
				loadingCanvasSizes.value = false
			}
		}
	}

	watch(
		() => props.open,
		(open) => {
			if (!open) return
			loadCanvasSizes()
		},
		{ immediate: true }
	)

	onBeforeUnmount(() => {
		canvasSizesRequestId.value += 1
	})

	const onSlugInput = (value: string | number) => {
		form.value.slug = String(value)
		slugManuallyEdited.value = form.value.slug !== lastGeneratedSlug.value
	}

	const addCanvasSize = (value: string | number | null) => {
		selectedCanvasSizeId.value = null
		if (value === null) return

		const id = Number(value)
		if (!Number.isFinite(id) || selectedSizeIds.value.has(id)) return

		const canvasSize = canvasSizes.value.find((size) => size.id === id)

		form.value.sizes.push({
			id,
			sort_order: form.value.sizes.length + 1,
			width: canvasSize?.width,
			height: canvasSize?.height,
			unit: canvasSize?.unit
		})
	}

	const removeCanvasSize = (size: CanvasFormatSize) => {
		form.value.sizes = form.value.sizes.filter((item) => item.id !== size.id)
	}

	const onSubmit = async () => {
		saving.value = true
		try {
			if (props.canvasFormat?.id) {
				await canvasFormatsApi.updateCanvasFormat(form.value)
			} else {
				await canvasFormatsApi.createCanvasFormat(form.value)
			}

			emit('saved')
			emit('close')

			if (!props.canvasFormat) {
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
						{{ canvasFormat ? 'Редактировать формат холста' : 'Добавить формат холста' }}
					</h3>
					<p class="mt-1 text-sm text-gray-600">Заполните поля и сохраните.</p>
				</div>
				<Button type="button" variant="ghost" size="icon" :on-click="() => $emit('close')" aria-label="Close">
					✕
				</Button>
			</div>

			<form class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2" @submit.prevent="onSubmit">
				<div class="md:col-span-1">
					<TextField v-model.trim="form.name" label="Название *" name="name" placeholder="Название" />
				</div>

				<div class="md:col-span-1">
					<TextField
						v-model.trim="form.slug"
						label="Slug"
						name="slug"
						placeholder="Slug"
						@update:model-value="onSlugInput"
					/>
				</div>

				<div class="md:col-span-1">
					<TextField v-model.number="form.sort_order" label="Порядок" name="sort_order" type="number" min="0" />
				</div>

				<CheckboxField v-model="form.is_active" label="Активно" name="is_active" class="md:col-span-2" />

				<div class="md:col-span-2">
					<SelectField
						:model-value="selectedCanvasSizeId"
						label="Размеры"
						name="sizes"
						placeholder="Выберите размер"
						:options="canvasSizeOptions"
						:disabled="loadingCanvasSizes || !canvasSizes.length"
						@update:model-value="addCanvasSize"
					/>

					<p v-if="loadingCanvasSizes" class="mt-2 text-sm text-gray-500">Загрузка...</p>
					<p v-else-if="!canvasSizes.length" class="mt-2 text-sm text-gray-500">Пока нет размеров холста.</p>
					<p v-else-if="!canvasSizeOptions.length && !form.sizes.length" class="mt-2 text-sm text-gray-500">
						Нет доступных размеров.
					</p>

					<div v-if="selectedCanvasSizes.length" class="mt-3 space-y-2">
						<div
							v-for="canvasSize in selectedCanvasSizes"
							:key="canvasSize.id"
							class="flex items-center justify-between gap-3 rounded-lg border border-gray-100 p-3"
						>
							<span class="text-sm font-medium text-gray-700">{{ getCanvasFormatSizeLabel(canvasSize) }}</span>
							<Button type="button" variant="ghost" size="sm" :on-click="() => removeCanvasSize(canvasSize)">
								Удалить
							</Button>
						</div>
					</div>
				</div>

				<div class="mt-2 flex items-center justify-end gap-3 md:col-span-2">
					<Button type="button" variant="outline" size="sm" @click="$emit('close')"> Отмена </Button>
					<Button type="submit" size="sm" :disabled="saving || !form.name || !form.slug" :loading="saving">
						{{ saving ? 'Сохранение...' : 'Сохранить' }}
					</Button>
				</div>
			</form>
		</div>
	</Modal>
</template>
