<script setup lang="ts">
	import { toTypedSchema } from '@vee-validate/zod'
	import { useForm } from 'vee-validate'
	import { computed, onBeforeUnmount, ref, watch } from 'vue'
	import { toast } from 'vue3-toastify'
	import { z } from 'zod'

	import Modal from '@/components/profile/Modal.vue'
	import Button from '@/shared/ui/Button.vue'
	import CheckboxField from '@/shared/ui/CheckboxField.vue'
	import SelectField from '@/shared/ui/SelectField.vue'
	import TextField from '@/shared/ui/TextField.vue'

	import { canvasSizesApi } from '@/modules/canvas-sizes/api/canvas-sizes'
	import type { CanvasSize } from '@/modules/canvas-sizes/types/canvas-size'
	import { slugify } from '@/shared'
	import { getFirstBackendValidationMessage } from '@/shared/api/validation'
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
	const triedSubmit = ref(false)
	const slugManuallyEdited = ref(false)
	const lastGeneratedSlug = ref('')

	const { errors, defineField, handleSubmit, resetForm, setValues, values } = useForm({
		initialValues: {
			id: null as number | null,
			name: '',
			slug: '',
			is_active: true,
			sort_order: 0,
			sizes: [] as CanvasFormatSize[]
		},
		validationSchema: toTypedSchema(
			z.object({
				id: z.number().nullable().optional(),
				name: z.string().trim().min(1, 'Укажите название'),
				slug: z.string().trim().min(1, 'Укажите slug'),
				is_active: z.boolean(),
				sort_order: z.coerce.number().min(0, 'Укажите корректный порядок'),
				sizes: z
					.array(
						z.object({
							id: z.number(),
							sort_order: z.number().optional(),
							width: z.any().optional(),
							height: z.any().optional(),
							unit: z.any().optional()
						})
					)
					.min(1, 'Выберите хотя бы один размер')
			})
		)
	})

	const [name, nameProps] = defineField('name')
	const [slug, slugProps] = defineField('slug')
	const [sortOrder, sortOrderProps] = defineField('sort_order')
	const [isActive] = defineField('is_active')

	const resetLocalForm = () => {
		resetForm({ values: { id: null, name: '', slug: '', is_active: true, sort_order: 0, sizes: [] } })
		triedSubmit.value = false
		slugManuallyEdited.value = false
		lastGeneratedSlug.value = ''
	}

	watch(
		() => [props.open, props.canvasFormat] as const,
		([open, canvasFormat]) => {
			if (!open) return
			if (!canvasFormat) {
				resetLocalForm()
				return
			}

			triedSubmit.value = false
			setValues({
				id: canvasFormat.id ?? null,
				name: canvasFormat.name ?? '',
				slug: canvasFormat.slug ?? '',
				is_active: !!canvasFormat.is_active,
				sort_order: canvasFormat.sort_order ?? 0,
				sizes: canvasFormat.sizes.map((size) => ({
					id: size.id,
					sort_order: size.sort_order
				}))
			})
			lastGeneratedSlug.value = slugify(canvasFormat.name ?? '')
			slugManuallyEdited.value = Boolean(canvasFormat.slug && canvasFormat.slug !== lastGeneratedSlug.value)
		},
		{ immediate: true }
	)

	watch(
		() => values.name,
		(name) => {
			const generatedSlug = slugify(name ?? '')

			if (!slugManuallyEdited.value || !values.slug || values.slug === lastGeneratedSlug.value) {
				setValues({ ...values, slug: generatedSlug } as any)
				slugManuallyEdited.value = false
			}

			lastGeneratedSlug.value = generatedSlug
		}
	)

	const selectedSizeIds = computed(() => new Set((values.sizes || []).map((size) => size.id)))
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
		(values.sizes || []).map((size) => {
			const canvasSize = canvasSizes.value.find((item) => item.id === size.id)

			return {
				...size,
				sort_order: size.sort_order ?? 0,
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
		setValues({ ...values, slug: String(value) } as any)
		slugManuallyEdited.value = String(value) !== lastGeneratedSlug.value
	}

	const addCanvasSize = (value: string | number | null) => {
		selectedCanvasSizeId.value = null
		if (value === null) return

		const id = Number(value)
		if (!Number.isFinite(id) || selectedSizeIds.value.has(id)) return

		const canvasSize = canvasSizes.value.find((size) => size.id === id)

		setValues({
			...values,
			sizes: [
				...(values.sizes || []),
				{
					id,
					sort_order: (values.sizes || []).length + 1,
					width: canvasSize?.width,
					height: canvasSize?.height,
					unit: canvasSize?.unit
				}
			]
		} as any)
	}

	const removeCanvasSize = (size: CanvasFormatSize) => {
		setValues({ ...values, sizes: (values.sizes || []).filter((item) => item.id !== size.id) } as any)
	}

	const onSubmit = handleSubmit(
		async (v) => {
			triedSubmit.value = true
			saving.value = true
			try {
				const payload: CanvasFormat = {
					id: v.id ?? null,
					name: v.name,
					slug: v.slug,
					is_active: !!v.is_active,
					sort_order: v.sort_order ?? 0,
					sizes: (v.sizes || []).map((size, index) => ({
						...size,
						sort_order: size.sort_order ?? index + 1
					}))
				}
				if (payload.id) {
					await canvasFormatsApi.updateCanvasFormat(payload)
				} else {
					await canvasFormatsApi.createCanvasFormat(payload)
				}

				emit('saved')
				emit('close')

				if (!props.canvasFormat) {
					resetLocalForm()
				}
			} catch (err) {
				const msg = getFirstBackendValidationMessage(err)
				if (msg) toast.error(msg)
				else throw err
			} finally {
				saving.value = false
			}
		},
		() => {
			triedSubmit.value = true
		}
	)
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
					<TextField
						v-model="name"
						v-bind="nameProps"
						label="Название *"
						name="name"
						placeholder="Название"
						:error-message="errors.name"
					/>
				</div>

				<div class="md:col-span-1">
					<TextField
						v-model="slug"
						v-bind="slugProps"
						label="Slug"
						name="slug"
						placeholder="Slug"
						:error-message="errors.slug"
						@update:model-value="onSlugInput"
					/>
				</div>

				<div class="md:col-span-1">
					<TextField
						:model-value="sortOrder as any"
						v-bind="sortOrderProps"
						label="Порядок"
						name="sort_order"
						type="number"
						min="0"
						:error-message="errors.sort_order"
						@update:model-value="(v) => ((sortOrder as any).value = v)"
					/>
				</div>

				<CheckboxField
					:model-value="isActive as any"
					label="Активно"
					name="is_active"
					class="md:col-span-2"
					@update:model-value="(v) => ((isActive as any).value = v)"
				/>

				<div class="md:col-span-2">
					<SelectField
						:model-value="selectedCanvasSizeId"
						label="Размеры"
						name="sizes"
						placeholder="Выберите размер"
						:options="canvasSizeOptions"
						:disabled="loadingCanvasSizes || !canvasSizes.length"
						:error-message="triedSubmit ? errors.sizes : ''"
						@update:model-value="addCanvasSize"
					/>

					<p v-if="loadingCanvasSizes" class="mt-2 text-sm text-gray-500">Загрузка...</p>
					<p v-else-if="!canvasSizes.length" class="mt-2 text-sm text-gray-500">Пока нет размеров холста.</p>
					<p v-else-if="!canvasSizeOptions.length && !(values.sizes || []).length" class="mt-2 text-sm text-gray-500">
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
					<Button type="submit" size="sm" :disabled="saving || Object.values(errors).some(Boolean)" :loading="saving">
						{{ saving ? 'Сохранение...' : 'Сохранить' }}
					</Button>
				</div>
			</form>
		</div>
	</Modal>
</template>
