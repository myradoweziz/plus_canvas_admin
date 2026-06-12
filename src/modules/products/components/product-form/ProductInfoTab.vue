<script setup lang="ts">
	import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
	import { useRouter } from 'vue-router'
	import { toast } from 'vue3-toastify'

	import Button from '@/shared/ui/Button.vue'
	import CheckboxField from '@/shared/ui/CheckboxField.vue'
	import CollageLayoutSvgImport from '@/shared/ui/CollageLayoutSvgImport.vue'
	import SelectField from '@/shared/ui/SelectField.vue'
	import SingleImageUpload from '@/shared/ui/SingleImageUpload.vue'
	import TextareaField from '@/shared/ui/TextareaField.vue'
	import TextField from '@/shared/ui/TextField.vue'

	import { getCanvasFormatSizeLabel } from '@/modules/canvas-formats/types'
	import { api as categoriesApi } from '@/modules/categories/api'
	import type { FeaturedCategory, SubCategory } from '@/modules/categories/types'
	import type { Color } from '@/modules/colors/types'
	import { TurkishLiraIcon } from '@/shared/icons'
	import { api } from '../../api'
	import { useFieldErrors, useProductFormDictionaries } from '../../composables'
	import {
		getErrorMessage,
		getValidationErrors,
		isPersonalCanvasCategory,
		PRODUCT_TYPE_OPTIONS,
		resolveUploadImageCount,
		validateProductInfo
	} from '../../helpers'
	import type { CanvasProduct, CollageLayout } from '../../types'

	defineOptions({ name: 'ProductInfoTab' })

	const PRODUCT_FIELD_ALIASES: Record<string, string> = {
		collage_layout: 'collage_layout_id',
		'collage_layout.id': 'collage_layout_id'
	}

	const form = defineModel<CanvasProduct>('form', { required: true })

	const props = defineProps<{
		productId: number | null
	}>()

	const emit = defineEmits<{
		created: [productId: number]
		updated: []
	}>()

	const productTypeOptions = [...PRODUCT_TYPE_OPTIONS]

	const setNullableNumber = (
		field: 'old_price' | 'cost_price' | 'max_cart_qty' | 'additional_shipping_charge' | 'weight',
		value: string | number | null
	) => {
		if (value === '' || value === null) {
			form.value[field] = null
			return
		}
		const num = Number(value)
		form.value[field] = Number.isFinite(num) ? num : null
	}

	const router = useRouter()
	const saving = ref(false)
	const loadingFeaturedCategories = ref(false)
	const loadingSubCategories = ref(false)
	const { validationErrors, clearFieldError } = useFieldErrors()
	const {
		loading: loadingDictionaries,
		mainCategories,
		banners,
		stocks,
		colors,
		canvasFormats,
		canvasSizes,
		canvasFrames,
		canvasEffects,
		load: loadDictionaries
	} = useProductFormDictionaries()
	const featuredCategoriesRequestId = ref(0)
	const subCategoriesRequestId = ref(0)
	const isApplyingProduct = ref(false)
	const selectedColorId = ref<number | null>(null)
	const selectedCanvasFormatId = ref<number | null>(null)
	const selectedCanvasSizeId = ref<number | null>(null)
	const selectedCanvasFrameId = ref<number | null>(null)
	const selectedCanvasEffectId = ref<number | null>(null)

	const featuredCategories = ref<FeaturedCategory[]>([])
	const subCategories = ref<SubCategory[]>([])
	const isEditMode = computed(() => props.productId != null)

	const clearValidationErrorOnChange = <K extends keyof CanvasProduct>(field: K) => {
		watch(
			() => form.value[field],
			() => clearFieldError(field as string),
			{ deep: Array.isArray(form.value[field]) }
		)
	}

	;(
		[
			'name',
			'price',
			'sku',
			'main_category_id',
			'category_id',
			'image',
			'colors',
			'canvas_formats',
			'canvas_sizes',
			'active_canvas_format_id',
			'frames',
			'product_tags',
			'collage_layout_id'
		] as const
	).forEach((field) => clearValidationErrorOnChange(field))

	const showsCollageLayout = computed(() => isPersonalCanvasCategory(form.value.main_category_type))

	const syncUploadImageCount = () => {
		form.value.upload_image_count = resolveUploadImageCount(form.value.collage_layout_id, form.value.collage_layout)
	}

	const onCollageLayoutUpdate = (layout: CollageLayout | null) => {
		form.value.collage_layout = layout
		if (layout?.id != null) {
			clearFieldError('collage_layout_id')
		}
		syncUploadImageCount()
	}

	const removeCollageLayout = () => {
		form.value.collage_layout_id = null
		form.value.collage_layout = null
		syncUploadImageCount()
	}

	const syncMainCategoryMeta = (mainCategoryId: number | null) => {
		if (!mainCategoryId) {
			form.value.main_category_type = ''
			return
		}

		const category = mainCategories.value.find((item) => item.id === mainCategoryId)
		if (!category && mainCategories.value.length === 0) {
			return
		}

		form.value.main_category_type = category?.category_type ?? ''

		if (!isApplyingProduct.value) {
			if (isPersonalCanvasCategory(form.value.main_category_type)) {
				form.value.collage_layout_id = null
				form.value.collage_layout = null
				syncUploadImageCount()
			} else {
				form.value.canvas_sizes = []
			}
		}
	}

	const toSelectOptions = <T extends { id: number | null }>(items: T[], getLabel: (item: T) => string) =>
		items
			.filter((item): item is T & { id: number } => item.id !== null)
			.map((item) => ({
				label: getLabel(item),
				value: item.id
			}))

	const mainCategoryOptions = computed(() => toSelectOptions(mainCategories.value, (item) => item.name))
	const featuredCategoryOptions = computed(() => toSelectOptions(featuredCategories.value, (item) => item.name))
	const subCategoryOptions = computed(() => toSelectOptions(subCategories.value, (item) => item.name))
	const bannerOptions = computed(() => toSelectOptions(banners.value, (item) => item.title))
	const stockOptions = computed(() => toSelectOptions(stocks.value, (item) => item.title))
	const colorOptions = computed(() =>
		colors.value
			.filter((color): color is Color & { id: number } => color.id !== null)
			.filter((color) => !form.value.colors.includes(color.id))
			.map((color) => ({
				label: color.name,
				value: color.id,
				color: color.hex_code
			}))
	)
	const canvasFormatOptions = computed(() =>
		toSelectOptions(canvasFormats.value, (item) => item.name).filter(
			(item) => !form.value.canvas_formats.includes(Number(item.value))
		)
	)
	const canvasSizeOptions = computed(() =>
		toSelectOptions(canvasSizes.value, (item) => getCanvasFormatSizeLabel(item)).filter(
			(item) => !form.value.canvas_sizes.includes(Number(item.value))
		)
	)
	const selectedColors = computed(() =>
		form.value.colors.map((id) => {
			const color = colors.value.find((item) => item.id === id)

			return {
				id,
				label: color?.name ?? `#${id}`,
				hexCode: color?.hex_code ?? '#E5E7EB'
			}
		})
	)
	const getCanvasFormatLabel = (id: number) => canvasFormats.value.find((format) => format.id === id)?.name ?? `#${id}`
	const getCanvasSizeLabel = (id: number) => {
		const size = canvasSizes.value.find((item) => item.id === id)
		return size ? getCanvasFormatSizeLabel(size) : `#${id}`
	}
	const canvasFrameOptions = computed(() =>
		toSelectOptions(canvasFrames.value, (item) => item.name).filter(
			(item) => !form.value.frames.includes(Number(item.value))
		)
	)
	const canvasEffectOptions = computed(() =>
		toSelectOptions(canvasEffects.value, (item) => item.name).filter(
			(item) => !form.value.effects.includes(Number(item.value))
		)
	)
	const selectedCanvasFrames = computed(() =>
		form.value.frames.map((id) => ({
			id,
			label: canvasFrames.value.find((frame) => frame.id === id)?.name ?? `#${id}`
		}))
	)
	const selectedCanvasEffects = computed(() =>
		form.value.effects.map((id) => ({
			id,
			label: canvasEffects.value.find((effect) => effect.id === id)?.name ?? `#${id}`
		}))
	)
	const syncCategoryCascade = async () => {
		isApplyingProduct.value = true
		syncMainCategoryMeta(form.value.main_category_id)

		if (form.value.main_category_id) {
			await loadFeaturedCategories(form.value.main_category_id)
		}

		if (form.value.category_id) {
			await loadSubCategories(form.value.category_id)
		}

		await nextTick()
		isApplyingProduct.value = false
	}

	defineExpose({
		beginProductApply: () => {
			isApplyingProduct.value = true
		},
		syncCategoryCascade
	})

	const loadFeaturedCategories = async (mainCategoryId: number) => {
		const requestId = featuredCategoriesRequestId.value + 1
		featuredCategoriesRequestId.value = requestId
		loadingFeaturedCategories.value = true

		try {
			const result = await categoriesApi.listFeaturedCategories({
				main_category_id: mainCategoryId,
				limit: 100,
				offset: 0
			})

			if (requestId !== featuredCategoriesRequestId.value) return
			featuredCategories.value = result.items || []
		} finally {
			if (requestId === featuredCategoriesRequestId.value) {
				loadingFeaturedCategories.value = false
			}
		}
	}

	const loadSubCategories = async (categoryId: number) => {
		const requestId = subCategoriesRequestId.value + 1
		subCategoriesRequestId.value = requestId
		loadingSubCategories.value = true

		try {
			const result = await categoriesApi.listSubCategories({
				category_id: categoryId,
				limit: 100,
				offset: 0
			})

			if (requestId !== subCategoriesRequestId.value) return
			subCategories.value = result.items || []
		} finally {
			if (requestId === subCategoriesRequestId.value) {
				loadingSubCategories.value = false
			}
		}
	}

	watch(mainCategories, () => {
		if (form.value.main_category_id) {
			syncMainCategoryMeta(form.value.main_category_id)
		}
	})

	watch(
		() => form.value.main_category_id,
		(mainCategoryId, oldMainCategoryId) => {
			syncMainCategoryMeta(mainCategoryId ?? null)

			if (!isApplyingProduct.value && oldMainCategoryId != null && mainCategoryId !== oldMainCategoryId) {
				form.value.category_id = null
				form.value.sub_category_id = null

				const category = mainCategories.value.find((item) => item.id === mainCategoryId)
				if (isPersonalCanvasCategory(category?.category_type)) {
					form.value.collage_layout_id = null
					form.value.collage_layout = null
					syncUploadImageCount()
				}
			}

			featuredCategories.value = []
			subCategories.value = []

			if (mainCategoryId && !isApplyingProduct.value) {
				loadFeaturedCategories(mainCategoryId)
			}
		}
	)

	watch(
		() => form.value.category_id,
		(categoryId, oldCategoryId) => {
			if (!isApplyingProduct.value && oldCategoryId != null && categoryId !== oldCategoryId) {
				form.value.sub_category_id = null
			}

			subCategories.value = []

			if (categoryId && !isApplyingProduct.value) {
				loadSubCategories(categoryId)
			}
		}
	)

	onMounted(async () => {
		await loadDictionaries()
	})

	onBeforeUnmount(() => {
		featuredCategoriesRequestId.value += 1
		subCategoriesRequestId.value += 1
	})

	const addColor = (value: string | number | null) => {
		selectedColorId.value = null
		if (value === null) return

		const id = Number(value)
		if (Number.isFinite(id) && !form.value.colors.includes(id)) {
			form.value.colors.push(id)
		}
	}

	const removeColor = (id: number) => {
		form.value.colors = form.value.colors.filter((item) => item !== id)
	}

	const isActiveCanvasFormat = (id: number) => form.value.active_canvas_format_id === id

	const setActiveCanvasFormat = (id: number, active: boolean) => {
		if (active) {
			form.value.active_canvas_format_id = id
			return
		}

		if (form.value.active_canvas_format_id === id) {
			form.value.active_canvas_format_id = null
		}
	}

	const addCanvasFormat = (value: string | number | null) => {
		selectedCanvasFormatId.value = null
		if (value === null) return

		const id = Number(value)
		if (Number.isFinite(id) && !form.value.canvas_formats.includes(id)) {
			form.value.canvas_formats.push(id)
			if (form.value.active_canvas_format_id == null) {
				form.value.active_canvas_format_id = id
			}
		}
	}

	const removeCanvasFormat = (id: number) => {
		form.value.canvas_formats = form.value.canvas_formats.filter((item) => item !== id)
		if (form.value.active_canvas_format_id === id) {
			form.value.active_canvas_format_id = form.value.canvas_formats[0] ?? null
		}
	}

	const addCanvasSize = (value: string | number | null) => {
		selectedCanvasSizeId.value = null
		if (value === null) return

		const id = Number(value)
		if (Number.isFinite(id) && !form.value.canvas_sizes.includes(id)) {
			form.value.canvas_sizes.push(id)
		}
	}

	const removeCanvasSize = (id: number) => {
		form.value.canvas_sizes = form.value.canvas_sizes.filter((item) => item !== id)
	}

	const addCanvasFrame = (value: string | number | null) => {
		selectedCanvasFrameId.value = null
		if (value === null) return

		const id = Number(value)
		if (Number.isFinite(id) && !form.value.frames.includes(id)) {
			form.value.frames.push(id)
		}
	}

	const removeCanvasFrame = (id: number) => {
		form.value.frames = form.value.frames.filter((item) => item !== id)
	}

	const addCanvasEffect = (value: string | number | null) => {
		selectedCanvasEffectId.value = null
		if (value === null) return

		const id = Number(value)
		if (Number.isFinite(id) && !form.value.effects.includes(id)) {
			form.value.effects.push(id)
		}
	}

	const removeCanvasEffect = (id: number) => {
		form.value.effects = form.value.effects.filter((item) => item !== id)
	}

	const onSubmit = async () => {
		validationErrors.value = validateProductInfo(form.value)
		if (Object.keys(validationErrors.value).length > 0) {
			toast.error(Object.values(validationErrors.value)[0] || 'Заполните обязательные поля')
			return
		}

		saving.value = true

		try {
			if (isEditMode.value && form.value.id) {
				await api.updateCanvasProduct(form.value)
				toast.success('Продукт успешно обновлен')
				emit('updated')
			} else {
				const created = await api.createCanvasProduct(form.value)
				form.value.id = created.id ?? null
				toast.success('Продукт успешно добавлен')
				if (created.id) {
					emit('created', created.id)
				}
			}
		} catch (error) {
			validationErrors.value = getValidationErrors(error, PRODUCT_FIELD_ALIASES)
			toast.error(getErrorMessage(error, 'Не удалось сохранить продукт'))
		} finally {
			saving.value = false
		}
	}
</script>

<template>
	<form class="contents" @submit.prevent="onSubmit">
		<TextField
			v-model.trim="form.name"
			label="Название"
			required
			name="name"
			placeholder="Название"
			:error-message="validationErrors.name"
		/>

		<TextField
			v-model.number="form.price"
			label="Цена"
			required
			name="price"
			type="number"
			min="0"
			:append-icon="TurkishLiraIcon"
			:error-message="validationErrors.price"
		/>

		<TextField v-model.trim="form.flag" label="Флаг" name="flag" placeholder="Флаг" />

		<TextField
			v-model.trim="form.sku"
			label="SKU"
			required
			name="sku"
			placeholder="Артикул (SKU)"
			:error-message="validationErrors.sku"
		/>

		<SelectField v-model="form.product_type" label="Тип продукта" name="product_type" :options="productTypeOptions" />

		<SelectField
			v-model="form.main_category_id"
			label="Главная категория"
			required
			name="main_category_id"
			placeholder="Выберите главную категорию"
			:options="mainCategoryOptions"
			:disabled="loadingDictionaries"
			:error-message="validationErrors.main_category_id"
		/>
		<SelectField
			v-model="form.category_id"
			label="Категория"
			required
			name="category_id"
			placeholder="Выберите категорию"
			:options="featuredCategoryOptions"
			:disabled="loadingDictionaries || loadingFeaturedCategories || !form.main_category_id"
			:error-message="validationErrors.category_id"
		/>
		<SelectField
			v-model="form.sub_category_id"
			label="Подкатегория"
			name="sub_category_id"
			placeholder="Выберите подкатегорию"
			:options="subCategoryOptions"
			:disabled="loadingDictionaries || loadingSubCategories || !form.category_id"
		/>

		<SelectField
			v-model="form.banner_id"
			label="Баннер"
			name="banner_id"
			placeholder="Выберите баннер"
			:options="bannerOptions"
			:disabled="loadingDictionaries"
		/>
		<SelectField
			v-model="form.stock_id"
			label="Акция"
			name="stock_id"
			placeholder="Выберите акцию"
			:options="stockOptions"
			:disabled="loadingDictionaries"
		/>

		<div v-if="showsCollageLayout" class="md:col-span-3 space-y-4">
			<CollageLayoutSvgImport
				v-model="form.collage_layout_id"
				:current-layout="form.collage_layout"
				:disabled="loadingDictionaries"
				:error-message="validationErrors.collage_layout_id ?? ''"
				@update:current-layout="onCollageLayoutUpdate"
				@remove="removeCollageLayout"
			/>
		</div>

		<div class="md:col-span-3">
			<SingleImageUpload
				v-model="form.image"
				label="Изображение"
				required
				:error-message="validationErrors.image"
				:uploader="(files, onProgress) => api.uploadImages(files, onProgress)"
			/>
		</div>

		<div class="md:col-span-3">
			<SelectField
				:model-value="selectedColorId"
				label="Цвета"
				required
				name="colors"
				placeholder="Выберите цвет"
				:options="colorOptions"
				:disabled="loadingDictionaries"
				:error-message="validationErrors.colors"
				@update:model-value="addColor"
			/>
			<div v-if="selectedColors.length" class="mt-3 flex flex-wrap gap-2">
				<span
					v-for="color in selectedColors"
					:key="color.id"
					class="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
				>
					<span class="h-4 w-4 rounded-full border border-gray-200" :style="{ backgroundColor: color.hexCode }"></span>
					<span>{{ color.label }}</span>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						class-name="h-5 w-5 text-gray-500 hover:text-red-600"
						:on-click="() => removeColor(color.id)"
					>
						✕
					</Button>
				</span>
			</div>
		</div>

		<div class="md:col-span-3">
			<SelectField
				:model-value="selectedCanvasFormatId"
				label="Форматы холста"
				name="canvas_formats"
				placeholder="Выберите формат"
				:options="canvasFormatOptions"
				:disabled="loadingDictionaries"
				:error-message="validationErrors.canvas_formats"
				@update:model-value="addCanvasFormat"
			/>
			<div v-if="form.canvas_formats.length" class="mt-3 flex flex-wrap gap-2">
				<span
					v-for="formatId in form.canvas_formats"
					:key="formatId"
					class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm text-gray-700"
					:class="isActiveCanvasFormat(formatId) ? 'bg-blue-50 text-blue-800 ring-1 ring-blue-200' : 'bg-gray-100'"
				>
					<label class="inline-flex cursor-pointer items-center">
						<input
							type="checkbox"
							class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
							:name="`canvas_format_active_${formatId}`"
							:checked="isActiveCanvasFormat(formatId)"
							@change="setActiveCanvasFormat(formatId, ($event.target as HTMLInputElement).checked)"
						/>
						<span class="sr-only">Активный формат: {{ getCanvasFormatLabel(formatId) }}</span>
					</label>
					<span>{{ getCanvasFormatLabel(formatId) }}</span>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						class-name="h-5 w-5 text-gray-500 hover:text-red-600"
						:on-click="() => removeCanvasFormat(formatId)"
					>
						✕
					</Button>
				</span>
			</div>
		</div>
		<div v-if="!form.canvas_formats?.length" class="md:col-span-3">
			<SelectField
				:model-value="selectedCanvasSizeId"
				label="Размеры холста"
				name="canvas_sizes"
				placeholder="Выберите размер"
				:options="canvasSizeOptions"
				:disabled="loadingDictionaries"
				:error-message="validationErrors.canvas_sizes"
				@update:model-value="addCanvasSize"
			/>
			<div v-if="form.canvas_sizes.length" class="mt-3 flex flex-wrap gap-2">
				<span
					v-for="sizeId in form.canvas_sizes"
					:key="sizeId"
					class="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
				>
					<span>{{ getCanvasSizeLabel(sizeId) }}</span>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						class-name="h-5 w-5 text-gray-500 hover:text-red-600"
						:on-click="() => removeCanvasSize(sizeId)"
					>
						✕
					</Button>
				</span>
			</div>
		</div>

		<div class="md:col-span-3">
			<SelectField
				:model-value="selectedCanvasFrameId"
				label="Рамки"
				name="frames"
				placeholder="Выберите рамку"
				:options="canvasFrameOptions"
				:disabled="loadingDictionaries"
				:error-message="validationErrors.frames"
				@update:model-value="addCanvasFrame"
			/>
			<div v-if="selectedCanvasFrames.length" class="mt-3 flex flex-wrap gap-2">
				<span
					v-for="frame in selectedCanvasFrames"
					:key="frame.id"
					class="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
				>
					{{ frame.label }}
					<Button
						type="button"
						variant="ghost"
						size="icon"
						class-name="h-5 w-5 text-gray-500 hover:text-red-600"
						:on-click="() => removeCanvasFrame(frame.id)"
					>
						✕
					</Button>
				</span>
			</div>
		</div>

		<div v-if="!showsCollageLayout" class="md:col-span-3">
			<SelectField
				:model-value="selectedCanvasEffectId"
				label="Эффекты"
				name="effects"
				placeholder="Выберите эффект (необязательно)"
				:options="canvasEffectOptions"
				:disabled="loadingDictionaries"
				:error-message="validationErrors.effects"
				@update:model-value="addCanvasEffect"
			/>
			<div v-if="selectedCanvasEffects.length" class="mt-3 flex flex-wrap gap-2">
				<span
					v-for="effect in selectedCanvasEffects"
					:key="effect.id"
					class="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
				>
					{{ effect.label }}
					<Button
						type="button"
						variant="ghost"
						size="icon"
						class-name="h-5 w-5 text-gray-500 hover:text-red-600"
						:on-click="() => removeCanvasEffect(effect.id)"
					>
						✕
					</Button>
				</span>
			</div>
		</div>

		<div class="md:col-span-3 border-t border-gray-200 pt-4">
			<p class="text-sm font-semibold text-gray-900">Цены</p>
		</div>

		<TextField
			:model-value="form.old_price ?? ''"
			label="Старая цена"
			name="old_price"
			type="number"
			min="0"
			:append-icon="TurkishLiraIcon"
			@update:model-value="(v) => setNullableNumber('old_price', v)"
		/>
		<TextField
			:model-value="form.cost_price ?? ''"
			label="Себестоимость"
			name="cost_price"
			type="number"
			min="0"
			:append-icon="TurkishLiraIcon"
			@update:model-value="(v) => setNullableNumber('cost_price', v)"
		/>

		<div class="md:col-span-3 border-t border-gray-200 pt-4">
			<p class="text-sm font-semibold text-gray-900">Корзина и отображение</p>
		</div>

		<TextField
			v-model.number="form.min_cart_qty"
			label="Мин. кол-во в корзине"
			name="min_cart_qty"
			type="number"
			min="1"
		/>
		<TextField
			:model-value="form.max_cart_qty ?? ''"
			label="Макс. кол-во в корзине"
			name="max_cart_qty"
			type="number"
			min="0"
			@update:model-value="(v) => setNullableNumber('max_cart_qty', v)"
		/>
		<TextField
			:model-value="form.delivery_time ?? ''"
			label="Срок доставки"
			name="delivery_time"
			placeholder="Напр. 3-5 дней"
			@update:model-value="(v) => (form.delivery_time = v ? String(v).trim() : null)"
		/>

		<CheckboxField
			v-model="form.show_on_homepage"
			label="Показывать на главной"
			name="show_on_homepage"
			class="md:col-span-1"
		/>
		<CheckboxField
			v-model="form.allow_customer_reviews"
			label="Разрешить отзывы"
			name="allow_customer_reviews"
			class="md:col-span-1"
		/>
		<CheckboxField v-model="form.is_published" label="Опубликован" name="is_published" class="md:col-span-1" />
		<CheckboxField
			v-model="form.disable_buy_button"
			label="Скрыть кнопку покупки"
			name="disable_buy_button"
			class="md:col-span-1"
		/>
		<CheckboxField
			v-model="form.available_for_preorder"
			label="Доступен для предзаказа"
			name="available_for_preorder"
			class="md:col-span-1"
		/>
		<CheckboxField v-model="form.call_for_price" label="Цена по запросу" name="call_for_price" class="md:col-span-1" />

		<div class="md:col-span-3 border-t border-gray-200 pt-4">
			<p class="text-sm font-semibold text-gray-900">Доставка</p>
		</div>

		<CheckboxField
			v-model="form.shipping_included"
			label="Доставка включена"
			name="shipping_included"
			class="md:col-span-1"
		/>
		<CheckboxField
			v-model="form.free_shipping"
			label="Бесплатная доставка"
			name="free_shipping"
			class="md:col-span-1"
		/>
		<CheckboxField
			v-model="form.separate_shipment"
			label="Отдельная отправка"
			name="separate_shipment"
			class="md:col-span-1"
		/>
		<TextField
			:model-value="form.additional_shipping_charge ?? ''"
			label="Доп. плата за доставку"
			name="additional_shipping_charge"
			type="number"
			min="0"
			:append-icon="TurkishLiraIcon"
			@update:model-value="(v) => setNullableNumber('additional_shipping_charge', v)"
		/>
		<TextField
			:model-value="form.weight ?? ''"
			label="Вес"
			name="weight"
			type="number"
			min="0"
			@update:model-value="(v) => setNullableNumber('weight', v)"
		/>

		<div class="md:col-span-3 border-t border-gray-200 pt-4">
			<p class="text-sm font-semibold text-gray-900">Доступность и комментарий</p>
		</div>

		<TextField
			:model-value="form.availability_start ?? ''"
			label="Доступен с"
			name="availability_start"
			type="datetime-local"
			@update:model-value="(v) => (form.availability_start = v ? String(v) : null)"
		/>
		<TextField
			:model-value="form.availability_end ?? ''"
			label="Доступен до"
			name="availability_end"
			type="datetime-local"
			@update:model-value="(v) => (form.availability_end = v ? String(v) : null)"
		/>

		<div class="md:col-span-3">
			<TextareaField
				v-model.trim="form.admin_comment"
				label="Комментарий администратора"
				name="admin_comment"
				placeholder="Внутренний комментарий"
			/>
		</div>

		<div class="mt-2 flex items-center justify-end gap-3 md:col-span-3">
			<Button type="button" variant="outline" size="sm" :on-click="() => router.push('/admin-panel/products')">
				Отмена
			</Button>
			<Button type="submit" size="sm" :disabled="saving" :loading="saving">
				{{ saving ? 'Сохранение...' : 'Сохранить продукт' }}
			</Button>
		</div>
	</form>
</template>
