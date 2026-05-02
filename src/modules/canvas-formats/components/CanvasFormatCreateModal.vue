<script setup lang="ts">
	import { computed, onBeforeUnmount, ref, watch } from 'vue'

	import Modal from '@/components/profile/Modal.vue'
	import Button from '@/shared/ui/Button.vue'
	import CheckboxField from '@/shared/ui/CheckboxField.vue'
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

	const toggleSize = (canvasSize: CanvasSize) => {
		if (!canvasSize.id) return

		const existingIndex = form.value.sizes.findIndex((size) => size.id === canvasSize.id)

		if (existingIndex >= 0) {
			form.value.sizes.splice(existingIndex, 1)
			return
		}

		form.value.sizes.push({
			id: canvasSize.id,
			sort_order: form.value.sizes.length + 1
		})
	}

	const updateSizeSortOrder = (size: CanvasFormatSize, value: string | number) => {
		size.sort_order = Number(value) || 0
	}

	const getSelectedSize = (canvasSize: CanvasSize) => {
		if (!canvasSize.id) return null

		return form.value.sizes.find((size) => size.id === canvasSize.id) ?? null
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
					<TextField v-model.trim="form.name" label="Name *" name="name" placeholder="Name" />
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
					<TextField v-model.number="form.sort_order" label="Sort Order" name="sort_order" type="number" min="0" />
				</div>

				<CheckboxField v-model="form.is_active" label="Active" name="is_active" class="md:col-span-2" />

				<div class="md:col-span-2">
					<label class="mb-1.5 block text-sm font-medium text-gray-700">Sizes</label>
					<div class="rounded-xl border border-gray-200 bg-white p-3">
						<p v-if="loadingCanvasSizes" class="text-sm text-gray-500">Загрузка...</p>
						<p v-else-if="!canvasSizes.length" class="text-sm text-gray-500">Пока нет размеров холста.</p>

						<div v-else class="space-y-2">
							<div
								v-for="canvasSize in canvasSizes"
								:key="canvasSize.id ?? getCanvasFormatSizeLabel(canvasSize)"
								class="flex flex-col gap-2 rounded-lg border border-gray-100 p-3 md:flex-row md:items-center md:justify-between"
							>
								<label class="flex items-center gap-2">
									<input
										type="checkbox"
										class="h-4 w-4"
										:checked="canvasSize.id !== null && selectedSizeIds.has(canvasSize.id)"
										@change="toggleSize(canvasSize)"
									/>
									<span class="text-sm font-medium text-gray-700">{{ getCanvasFormatSizeLabel(canvasSize) }}</span>
								</label>

								<TextField
									v-if="getSelectedSize(canvasSize)"
									:model-value="getSelectedSize(canvasSize)?.sort_order"
									label="Sort"
									:name="`size_${canvasSize.id}_sort_order`"
									type="number"
									min="0"
									class="md:w-32"
									@update:model-value="updateSizeSortOrder(getSelectedSize(canvasSize)!, $event)"
								/>
							</div>
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
