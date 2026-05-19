<script setup lang="ts">
	import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
	import { useRoute, useRouter } from 'vue-router'
	import { toast } from 'vue3-toastify'

	import Button from '@/shared/ui/Button.vue'
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
	import { discountsApi } from '@/modules/discounts/api/discounts'
	import type { Discount } from '@/modules/discounts/types/discount'
	import { slugify } from '@/shared'
	import { api } from '../api'
	import type { CanvasProduct } from '../types/product'

	const route = useRoute()
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
	const slugManuallyEdited = ref(false)
	const lastGeneratedSlug = ref('')
	const selectedColorId = ref<number | null>(null)
	const selectedCanvasFormatId = ref<number | null>(null)
	const selectedCanvasFrameId = ref<number | null>(null)
	const selectedCanvasEffectId = ref<number | null>(null)

	const mainCategories = ref<MainCategory[]>([])
	const featuredCategories = ref<FeaturedCategory[]>([])
	const subCategories = ref<SubCategory[]>([])
	const brands = ref<Brand[]>([])
	const banners = ref<Banner[]>([])
	const discounts = ref<Discount[]>([])
	const colors = ref<Color[]>([])
	const canvasFormats = ref<CanvasFormat[]>([])
	const canvasFrames = ref<CanvasFrame[]>([])
	const canvasEffects = ref<CanvasEffect[]>([])
	const product = ref<CanvasProduct | null>(null)
	const productId = computed(() => {
		const id = Number(route.params.id)
		return Number.isFinite(id) ? id : null
	})

	const getErrorData = (error: unknown) => {
		return (error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })?.response?.data
	}

	const getValidationErrors = (error: unknown) => {
		const errors = getErrorData(error)?.errors
		if (!errors) return {}

		return Object.fromEntries(
			Object.entries(errors).map(([field, messages]) => [field, messages?.[0] ?? 'Некорректное значение'])
		)
	}

	const getErrorMessage = (error: unknown) => {
		const data = getErrorData(error)
		const firstValidationMessage = Object.values(data?.errors || {})[0]?.[0]

		return firstValidationMessage || data?.message || 'Не удалось сохранить продукт'
	}

	const setRequiredError = (errors: Record<string, string>, field: keyof CanvasProduct, label: string) => {
		const value = form.value[field]
		if (value === null || value === undefined || value === '') {
			errors[field] = `Поле "${label}" обязательно.`
		}
	}

	const validateForm = () => {
		const errors: Record<string, string> = {}

		setRequiredError(errors, 'name', 'Name')
		setRequiredError(errors, 'slug', 'Slug')
		setRequiredError(errors, 'description', 'Description')
		setRequiredError(errors, 'price', 'Price')
		setRequiredError(errors, 'product_qode', 'Product Qode')
		setRequiredError(errors, 'main_category_id', 'Main Category')
		setRequiredError(errors, 'category_id', 'Category')

		if (!Number.isFinite(Number(form.value.price)) || Number(form.value.price) <= 0) {
			errors.price = 'Цена должна быть больше 0.'
		}

		if (!form.value.images.length) {
			errors.images = 'Изображения обязательны.'
		}

		if (!form.value.colors.length) {
			errors.colors = 'Выберите хотя бы один цвет.'
		}

		if (!form.value.canvas_formats.length) {
			errors.canvas_formats = 'Выберите хотя бы один формат.'
		}

		if (!form.value.frames.length) {
			errors.frames = 'Выберите хотя бы одну рамку.'
		}

		validationErrors.value = errors
		return Object.keys(errors).length === 0
	}

	const form = ref<CanvasProduct>({
		id: null,
		name: '',
		slug: '',
		description: '',
		price: 0,
		discount: 0,
		images: [],
		inner_images: [],
		upload_image_count: 1,
		main_category_id: null,
		main_category_slug: '',
		category_id: null,
		sub_category_id: null,
		brand_id: null,
		banner_id: null,
		flag: '',
		product_qode: '',
		discount_id: null,
		colors: [],
		canvas_formats: [],
		frames: [],
		effects: [],
		collage_layout_id: null,
		collage_layout: null
	})

	const resetForm = () => {
		form.value = {
			id: null,
			name: '',
			slug: '',
			description: '',
			price: 0,
			discount: 0,
			images: [],
			inner_images: [],
			upload_image_count: 1,
			main_category_id: null,
			main_category_slug: '',
			category_id: null,
			sub_category_id: null,
			brand_id: null,
			banner_id: null,
			flag: '',
			product_qode: '',
			discount_id: null,
			colors: [],
			canvas_formats: [],
			frames: [],
			effects: [],
			collage_layout_id: null,
			collage_layout: null
		}
	}

	const INNER_IMAGES_MAIN_CATEGORY_SLUG = 'kisiye-ozel-kanvas-tablo'

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

		if (form.value.main_category_slug !== INNER_IMAGES_MAIN_CATEGORY_SLUG && !isApplyingProduct.value) {
			form.value.inner_images = []
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
	const discountOptions = computed(() => toSelectOptions(discounts.value, (item) => item.title))
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
	watch(
		() => product.value,
		(product) => {
			if (!product) {
				resetForm()
				slugManuallyEdited.value = false
				lastGeneratedSlug.value = ''
				return
			}

			isApplyingProduct.value = true
			form.value = {
				id: product.id ?? null,
				name: product.name ?? '',
				slug: product.slug ?? '',
				description: product.description ?? '',
				price: product.price ?? 0,
				discount: product.discount ?? 0,
				images: product.images || [],
				inner_images: product.inner_images || [],
				upload_image_count: product.upload_image_count ?? 1,
				main_category_id: product.main_category_id ?? null,
				main_category_slug:
					product.main_category_slug ?? (product as { main_category?: { slug?: string } }).main_category?.slug ?? '',
				category_id: product.category_id ?? null,
				sub_category_id: product.sub_category_id ?? null,
				brand_id: product.brand_id ?? null,
				banner_id: product.banner_id ?? null,
				flag: product.flag ?? '',
				product_qode: product.product_qode ?? '',
				discount_id: product.discount_id ?? null,
				colors: product.colors || [],
				canvas_formats: product.canvas_formats || [],
				frames: product.frames || [],
				effects: product.effects || [],
				collage_layout_id: product.collage_layout_id ?? product.collage_layout?.id ?? null,
				collage_layout: product.collage_layout ?? null
			}
			nextTick(() => {
				syncMainCategorySlug(form.value.main_category_id)
				isApplyingProduct.value = false
			})
			lastGeneratedSlug.value = slugify(product.name ?? '')
			slugManuallyEdited.value = Boolean(product.slug && product.slug !== lastGeneratedSlug.value)
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

	const loadDictionaries = async () => {
		const requestId = dictionaryRequestId.value + 1
		dictionaryRequestId.value = requestId
		loadingDictionaries.value = true

		try {
			const [
				mainCategoriesResult,
				brandsResult,
				bannersResult,
				discountsResult,
				colorsResult,
				canvasFormatsResult,
				canvasFramesResult,
				canvasEffectsResult
			] = await Promise.all([
				categoriesApi.listMainCategories({ limit: 100, offset: 0 }),
				brandsApi.listBrands({ limit: 100, offset: 0 }),
				bannersApi.listBanners(),
				discountsApi.listDiscounts({ limit: 100, offset: 0 }),
				colorsApi.listColors({ limit: 100, offset: 0 }),
				canvasFormatsApi.listCanvasFormats({ limit: 100, offset: 0 }),
				canvasFramesApi.listCanvasFrames({ limit: 100, offset: 0 }),
				canvasEffectsApi.listCanvasEffects({ limit: 100, offset: 0 })
			])

			if (requestId !== dictionaryRequestId.value) return

			mainCategories.value = mainCategoriesResult.items || []
			brands.value = brandsResult.items || []
			banners.value = bannersResult || []
			discounts.value = discountsResult.items || []
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

	const loadProduct = async () => {
		if (!productId.value) return
		product.value = await api.getCanvasProduct(productId.value)
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
				if (slug !== INNER_IMAGES_MAIN_CATEGORY_SLUG) {
					form.value.inner_images = []
					form.value.collage_layout_id = null
					form.value.collage_layout = null
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
		if (productId.value) {
			await loadProduct()
		}

		await loadDictionaries()
	})

	onBeforeUnmount(() => {
		dictionaryRequestId.value += 1
		featuredCategoriesRequestId.value += 1
		subCategoriesRequestId.value += 1
	})

	const onSlugInput = (value: string | number) => {
		form.value.slug = String(value)
		slugManuallyEdited.value = form.value.slug !== lastGeneratedSlug.value
	}

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
		validationErrors.value = {}

		if (!validateForm()) {
			toast.error(Object.values(validationErrors.value)[0] || 'Заполните обязательные поля')
			return
		}

		saving.value = true

		try {
			if (product.value?.id) {
				await api.updateCanvasProduct(form.value)
				toast.success('Продукт успешно обновлен')
			} else {
				await api.createCanvasProduct(form.value)
				toast.success('Продукт успешно добавлен')
			}

			router.push('/admin-panel/products')
		} catch (error) {
			validationErrors.value = getValidationErrors(error)
			toast.error(getErrorMessage(error))
		} finally {
			saving.value = false
		}
	}
</script>

<template>
	<div class="space-y-6">
		<div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
			<div class="flex items-start justify-between gap-4">
				<div class="min-w-0">
					<h3 class="text-lg font-semibold text-gray-900">
						{{ product ? 'Редактировать продукт' : 'Добавить продукт' }}
					</h3>
					<p class="mt-1 text-sm text-gray-600">Заполните поля и сохраните.</p>
				</div>
				<Button type="button" variant="outline" size="sm" :on-click="() => router.push('/admin-panel/products')"
					>Назад</Button
				>
			</div>

			<form class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3" @submit.prevent="onSubmit">
				<TextField
					v-model.trim="form.name"
					label="Название *"
					name="name"
					placeholder="Название"
					:error-message="validationErrors.name"
				/>
				<TextField
					v-model.trim="form.slug"
					label="Slug"
					name="slug"
					placeholder="Slug"
					:error-message="validationErrors.slug"
					@update:model-value="onSlugInput"
				/>
				<TextField
					v-model.number="form.price"
					label="Цена"
					name="price"
					type="number"
					min="0"
					:error-message="validationErrors.price"
				/>

				<TextField v-model.number="form.discount" label="Кол-во скидки" name="discount" type="number" min="0" />

				<TextField
					v-model.number="form.upload_image_count"
					label="Кол-во изображений для загрузки"
					name="upload_image_count"
					type="number"
					min="1"
				/>
				<TextField v-model.trim="form.flag" label="Флаг" name="flag" placeholder="Флаг" />
				<TextField
					v-model.trim="form.product_qode"
					label="Код продукта"
					name="product_qode"
					placeholder="Код продукта"
					:error-message="validationErrors.product_qode"
				/>

				<div class="md:col-span-3">
					<TextareaField
						v-model.trim="form.description"
						label="Описание"
						name="description"
						placeholder="Описание"
						:error-message="validationErrors.description"
					/>
				</div>

				<SelectField
					v-model="form.main_category_id"
					label="Главная категория"
					name="main_category_id"
					placeholder="Выберите главную категорию"
					:options="mainCategoryOptions"
					:disabled="loadingDictionaries"
					:error-message="validationErrors.main_category_id"
				/>
				<SelectField
					v-model="form.category_id"
					label="Категория"
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
					v-model="form.discount_id"
					label="Скидка"
					name="discount_id"
					placeholder="Выберите скидку"
					:options="discountOptions"
					:disabled="loadingDictionaries"
				/>

				<div class="md:col-span-3">
					<MultiImageUpload
						v-model="form.images"
						label="Images"
						description="Выберите одну или несколько картинок продукта."
						:error-message="validationErrors.images"
						:uploader="(files, onProgress) => api.uploadImages(files, onProgress)"
					/>
				</div>
				<div v-if="form.main_category_slug === INNER_IMAGES_MAIN_CATEGORY_SLUG" class="md:col-span-3 space-y-4">
					<MultiImageUpload
						v-model="form.inner_images"
						label="Inner Images"
						description="Выберите одну или несколько внутренних картинок продукта."
						:uploader="(files, onProgress) => api.uploadImages(files, onProgress)"
					/>
				</div>
				<CollageLayoutSvgImport
					v-model="form.collage_layout_id"
					:current-layout="form.collage_layout"
					:disabled="loadingDictionaries"
					:error-message="validationErrors.collage_layout_id"
					@update:current-layout="(layout) => (form.collage_layout = layout)"
					class="md:col-span-3"
				/>

				<div class="md:col-span-3">
					<SelectField
						:model-value="selectedColorId"
						label="Цвета"
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
							<span
								class="h-4 w-4 rounded-full border border-gray-200"
								:style="{ backgroundColor: color.hexCode }"
							></span>
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
						label="Рамки *"
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

				<div class="mt-2 flex items-center justify-end gap-3 md:col-span-3">
					<Button type="button" variant="outline" size="sm" :on-click="() => router.push('/admin-panel/products')">
						Отмена
					</Button>
					<Button type="submit" size="sm" :disabled="saving" :loading="saving">
						{{ saving ? 'Сохранение...' : 'Сохранить' }}
					</Button>
				</div>
			</form>
		</div>
	</div>
</template>
