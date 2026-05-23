<script setup lang="ts">
	import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
	import { useRouter } from 'vue-router'
	import { toast } from 'vue3-toastify'

	import Button from '@/shared/ui/Button.vue'
	import CheckboxField from '@/shared/ui/CheckboxField.vue'
	import CollageLayoutSvgImport from '@/shared/ui/CollageLayoutSvgImport.vue'
	import MultiImageUpload from '@/shared/ui/MultiImageUpload.vue'
	import SelectField from '@/shared/ui/SelectField.vue'
	import TextareaField from '@/shared/ui/TextareaField.vue'
	import TextField from '@/shared/ui/TextField.vue'

	import { bannersApi } from '@/modules/banners/api/banners'
	import type { Banner } from '@/modules/banners/types/banner'
	import { brandsApi } from '@/modules/brands/api/brands'
	import type { Brand } from '@/modules/brands/types/brand'
	import { canvasEffectsApi } from '@/modules/canvas-effects/api/canvas-effects'
	import type { CanvasEffect } from '@/modules/canvas-effects/types/canvas-effect'
	import { canvasFormatsApi } from '@/modules/canvas-formats/api/canvas-formats'
	import type { CanvasFormat } from '@/modules/canvas-formats/types/canvas-format'
	import { canvasFramesApi } from '@/modules/canvas-frames/api/canvas-frames'
	import type { CanvasFrame } from '@/modules/canvas-frames/types/canvas-frame'
	import { categoriesApi } from '@/modules/categories/api'
	import type { FeaturedCategory, MainCategory, SubCategory } from '@/modules/categories/types/category'
	import { colorsApi } from '@/modules/colors/api/colors'
	import type { Color } from '@/modules/colors/types/color'
	import { stocksApi } from '@/modules/stocks/api/stocks'
	import type { Stock } from '@/modules/stocks/types/stock'
	import { api } from '../../api'
	import { getErrorMessage, getValidationErrors } from '../../helpers/form-errors'
	import {
		createEmptyCanvasProduct,
		INNER_IMAGES_MAIN_CATEGORY_SLUG,
		PRODUCT_TYPE_OPTIONS
	} from '../../helpers/product-form'
	import { uploadImageCountFromLayout, validateProductInfo } from '../../helpers/product-form-validation'
	import type { CollageLayout } from '../../types/collage-layout'
	import type { CanvasProduct } from '../../types/product'

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
		field: 'old_price' | 'cost_price' | 'special_price' | 'max_cart_qty' | 'additional_shipping_charge' | 'weight',
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
	const loadingDictionaries = ref(false)
	const loadingFeaturedCategories = ref(false)
	const loadingSubCategories = ref(false)
	const validationErrors = ref<Record<string, string>>({})
	const dictionaryRequestId = ref(0)
	const featuredCategoriesRequestId = ref(0)
	const subCategoriesRequestId = ref(0)
	const isApplyingProduct = ref(false)
	const selectedColorId = ref<number | null>(null)
	const selectedCanvasFormatId = ref<number | null>(null)
	const selectedCanvasFrameId = ref<number | null>(null)
	const selectedCanvasEffectId = ref<number | null>(null)

	const mainCategories = ref<MainCategory[]>([])
	const featuredCategories = ref<FeaturedCategory[]>([])
	const subCategories = ref<SubCategory[]>([])
	const brands = ref<Brand[]>([])
	const banners = ref<Banner[]>([])
	const stocks = ref<Stock[]>([])
	const colors = ref<Color[]>([])
	const canvasFormats = ref<CanvasFormat[]>([])
	const canvasFrames = ref<CanvasFrame[]>([])
	const canvasEffects = ref<CanvasEffect[]>([])
	const isEditMode = computed(() => props.productId != null)

	const clearValidationError = (field: string) => {
		if (!validationErrors.value[field]) return
		const next = { ...validationErrors.value }
		delete next[field]
		validationErrors.value = next
	}

	const clearValidationErrorOnChange = <K extends keyof CanvasProduct>(field: K) => {
		watch(
			() => form.value[field],
			() => clearValidationError(field as string),
			{ deep: Array.isArray(form.value[field]) }
		)
	}

	;(
		[
			'name',
			'description',
			'price',
			'product_qode',
			'main_category_id',
			'category_id',
			'images',
			'colors',
			'canvas_formats',
			'frames',
			'collage_layout_id',
			'inner_images'
		] as const
	).forEach((field) => clearValidationErrorOnChange(field))

	const requiredInnerImagesCount = computed(() =>
		form.value.main_category_slug !== INNER_IMAGES_MAIN_CATEGORY_SLUG
			? uploadImageCountFromLayout(form.value.collage_layout ?? null)
			: 0
	)

	const onCollageLayoutUpdate = (layout: CollageLayout | null) => {
		form.value.collage_layout = layout
		const slots = uploadImageCountFromLayout(layout)
		form.value.upload_image_count = slots > 0 ? slots : 1
		if (layout?.id != null) {
			clearValidationError('collage_layout_id')
		}
		clearValidationError('inner_images')
	}

	const syncMainCategorySlug = (mainCategoryId: number | null) => {
		if (!mainCategoryId) {
			form.value.main_category_slug = ''
			if (!isApplyingProduct.value) {
				form.value.inner_images = []
			}
			return
		}

		const category = mainCategories.value.find((item) => item.id === mainCategoryId)
		if (!category && mainCategories.value.length === 0) {
			return
		}

		form.value.main_category_slug = category?.slug ?? ''

		if (form.value.main_category_slug === INNER_IMAGES_MAIN_CATEGORY_SLUG && !isApplyingProduct.value) {
			form.value.inner_images = []
			form.value.collage_layout_id = null
			form.value.collage_layout = null
			form.value.upload_image_count = 1
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
	const brandOptions = computed(() => toSelectOptions(brands.value, (item) => item.name))
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
	const selectedCanvasFormats = computed(() =>
		form.value.canvas_formats.map((id) => ({
			id,
			label: canvasFormats.value.find((format) => format.id === id)?.name ?? `#${id}`
		}))
	)
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
	const applyLoadedProduct = (product: CanvasProduct) => {
		isApplyingProduct.value = true
		form.value = {
			...createEmptyCanvasProduct(),
			...product,
			main_category_slug:
				product.main_category_slug ?? (product as { main_category?: { slug?: string } }).main_category?.slug ?? '',
			collage_layout_id: product.collage_layout_id ?? product.collage_layout?.id ?? null,
			collage_layout: product.collage_layout ?? null
		}
		if (form.value.collage_layout) {
			form.value.upload_image_count = uploadImageCountFromLayout(form.value.collage_layout)
		}
		nextTick(() => {
			syncMainCategorySlug(form.value.main_category_id)
			isApplyingProduct.value = false
		})
	}

	defineExpose({ applyLoadedProduct })

	const loadDictionaries = async () => {
		const requestId = dictionaryRequestId.value + 1
		dictionaryRequestId.value = requestId
		loadingDictionaries.value = true

		try {
			const [
				mainCategoriesResult,
				brandsResult,
				bannersResult,
				stocksResult,
				colorsResult,
				canvasFormatsResult,
				canvasFramesResult,
				canvasEffectsResult
			] = await Promise.all([
				categoriesApi.listMainCategories({ limit: 100, offset: 0 }),
				brandsApi.listBrands({ limit: 100, offset: 0 }),
				bannersApi.listBanners(),
				stocksApi.listStocks({ limit: 100, offset: 0 }),
				colorsApi.listColors({ limit: 100, offset: 0 }),
				canvasFormatsApi.listCanvasFormats({ limit: 100, offset: 0 }),
				canvasFramesApi.listCanvasFrames({ limit: 100, offset: 0 }),
				canvasEffectsApi.listCanvasEffects({ limit: 100, offset: 0 })
			])

			if (requestId !== dictionaryRequestId.value) return

			mainCategories.value = mainCategoriesResult.items || []
			brands.value = brandsResult.items || []
			banners.value = bannersResult || []
			stocks.value = stocksResult.items || []
			colors.value = colorsResult.items || []
			canvasFormats.value = canvasFormatsResult.items || []
			canvasFrames.value = canvasFramesResult.items || []
			canvasEffects.value = canvasEffectsResult.items || []

			if (form.value.main_category_id) {
				syncMainCategorySlug(form.value.main_category_id)
				await loadFeaturedCategories(form.value.main_category_id)
			}

			if (form.value.category_id) {
				await loadSubCategories(form.value.category_id)
			}
		} finally {
			if (requestId === dictionaryRequestId.value) {
				loadingDictionaries.value = false
			}
		}
	}

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
			syncMainCategorySlug(form.value.main_category_id)
		}
	})

	watch(
		() => form.value.main_category_id,
		(mainCategoryId, oldMainCategoryId) => {
			syncMainCategorySlug(mainCategoryId ?? null)

			if (!isApplyingProduct.value && oldMainCategoryId !== undefined && mainCategoryId !== oldMainCategoryId) {
				form.value.category_id = null
				form.value.sub_category_id = null

				const category = mainCategories.value.find((item) => item.id === mainCategoryId)
				const slug = category?.slug ?? ''
				if (slug === INNER_IMAGES_MAIN_CATEGORY_SLUG) {
					form.value.inner_images = []
					form.value.collage_layout_id = null
					form.value.collage_layout = null
					form.value.upload_image_count = 1
				}
			}

			featuredCategories.value = []
			subCategories.value = []

			if (mainCategoryId) {
				loadFeaturedCategories(mainCategoryId)
			}
		}
	)

	watch(
		() => form.value.category_id,
		(categoryId, oldCategoryId) => {
			if (!isApplyingProduct.value && oldCategoryId !== undefined && categoryId !== oldCategoryId) {
				form.value.sub_category_id = null
			}

			subCategories.value = []

			if (categoryId) {
				loadSubCategories(categoryId)
			}
		}
	)

	onMounted(async () => {
		await loadDictionaries()
	})

	onBeforeUnmount(() => {
		dictionaryRequestId.value += 1
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

	const addCanvasFormat = (value: string | number | null) => {
		selectedCanvasFormatId.value = null
		if (value === null) return

		const id = Number(value)
		if (Number.isFinite(id) && !form.value.canvas_formats.includes(id)) {
			form.value.canvas_formats.push(id)
		}
	}

	const removeCanvasFormat = (id: number) => {
		form.value.canvas_formats = form.value.canvas_formats.filter((item) => item !== id)
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
			:error-message="validationErrors.price"
		/>

		<TextField v-model.number="form.discount" label="Скидка %" name="discount" type="number" min="0" />

		<TextField v-model.trim="form.flag" label="Флаг" name="flag" placeholder="Флаг" />
		<TextField
			v-model.trim="form.product_qode"
			label="Код продукта"
			required
			name="product_qode"
			placeholder="Код продукта"
			:error-message="validationErrors.product_qode"
		/>

		<div class="md:col-span-3">
			<TextareaField
				v-model.trim="form.description"
				label="Описание"
				required
				name="description"
				placeholder="Описание"
				:error-message="validationErrors.description"
			/>
		</div>

		<div class="md:col-span-3">
			<TextareaField
				v-model.trim="form.short_description"
				label="Краткое описание"
				name="short_description"
				placeholder="Краткое описание"
			/>
		</div>

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
			v-model="form.brand_id"
			label="Тег"
			name="brand_id"
			placeholder="Выберите тег"
			:options="brandOptions"
			:disabled="loadingDictionaries"
			:error-message="validationErrors.brand_id"
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
			label="Скидка"
			name="stock_id"
			placeholder="Выберите скидку"
			:options="stockOptions"
			:disabled="loadingDictionaries"
		/>

		<div class="md:col-span-3">
			<MultiImageUpload
				v-model="form.images"
				label="Изображения"
				required
				description="Выберите одну или несколько картинок продукта."
				:error-message="validationErrors.images"
				:uploader="(files, onProgress) => api.uploadImages(files, onProgress)"
			/>
		</div>

		<div v-if="form.main_category_slug !== INNER_IMAGES_MAIN_CATEGORY_SLUG" class="md:col-span-3 space-y-4">
			<MultiImageUpload
				v-model="form.inner_images"
				label="Внутренние изображения"
				required
				:description="
					requiredInnerImagesCount > 0
						? `Загрузите ровно ${requiredInnerImagesCount} изображений — по числу слотов в SVG layout.`
						: 'Сначала импортируйте SVG layout.'
				"
				:error-message="validationErrors.inner_images"
				:uploader="(files, onProgress) => api.uploadImages(files, onProgress)"
			/>
		</div>

		<CollageLayoutSvgImport
			v-model="form.collage_layout_id"
			:current-layout="form.collage_layout"
			:disabled="loadingDictionaries"
			required
			:error-message="validationErrors.collage_layout_id ?? ''"
			@update:current-layout="onCollageLayoutUpdate"
			class="md:col-span-3"
		/>

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
				required
				name="canvas_formats"
				placeholder="Выберите формат"
				:options="canvasFormatOptions"
				:disabled="loadingDictionaries"
				:error-message="validationErrors.canvas_formats"
				@update:model-value="addCanvasFormat"
			/>
			<div v-if="selectedCanvasFormats.length" class="mt-3 flex flex-wrap gap-2">
				<span
					v-for="format in selectedCanvasFormats"
					:key="format.id"
					class="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
				>
					{{ format.label }}
					<Button
						type="button"
						variant="ghost"
						size="icon"
						class-name="h-5 w-5 text-gray-500 hover:text-red-600"
						:on-click="() => removeCanvasFormat(format.id)"
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
				required
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

		<div class="md:col-span-3">
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
			<p class="text-sm font-semibold text-gray-900">Цены и спецпредложение</p>
		</div>

		<TextField
			:model-value="form.old_price ?? ''"
			label="Старая цена"
			name="old_price"
			type="number"
			min="0"
			@update:model-value="(v) => setNullableNumber('old_price', v)"
		/>
		<TextField
			:model-value="form.cost_price ?? ''"
			label="Себестоимость"
			name="cost_price"
			type="number"
			min="0"
			@update:model-value="(v) => setNullableNumber('cost_price', v)"
		/>
		<TextField
			:model-value="form.special_price ?? ''"
			label="Спец. цена"
			name="special_price"
			type="number"
			min="0"
			@update:model-value="(v) => setNullableNumber('special_price', v)"
		/>
		<TextField
			:model-value="form.special_price_start ?? ''"
			label="Спец. цена с"
			name="special_price_start"
			type="datetime-local"
			@update:model-value="(v) => (form.special_price_start = v ? String(v) : null)"
		/>
		<TextField
			:model-value="form.special_price_end ?? ''"
			label="Спец. цена до"
			name="special_price_end"
			type="datetime-local"
			@update:model-value="(v) => (form.special_price_end = v ? String(v) : null)"
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
