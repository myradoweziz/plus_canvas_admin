<script setup lang="ts">
	import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
	import { useRoute, useRouter } from 'vue-router'
	import { toast } from 'vue3-toastify'

	import Button from '@/shared/ui/Button.vue'
	import MultiImageUpload from '@/shared/ui/MultiImageUpload.vue'
	import SelectField from '@/shared/ui/SelectField.vue'
	import TextareaField from '@/shared/ui/TextareaField.vue'
	import TextField from '@/shared/ui/TextField.vue'

	import { bannersApi } from '@/modules/banners/api/banners'
	import type { Banner } from '@/modules/banners/types/banner'
	import { brandsApi } from '@/modules/brands/api/brands'
	import type { Brand } from '@/modules/brands/types/brand'
	import { canvasFormatsApi } from '@/modules/canvas-formats/api/canvas-formats'
	import type { CanvasFormat } from '@/modules/canvas-formats/types/canvas-format'
	import { categoriesApi } from '@/modules/categories/api'
	import type { FeaturedCategory, MainCategory, SubCategory } from '@/modules/categories/types/category'
	import { colorsApi } from '@/modules/colors/api/colors'
	import type { Color } from '@/modules/colors/types/color'
	import { discountsApi } from '@/modules/discounts/api/discounts'
	import type { Discount } from '@/modules/discounts/types/discount'
	import { slugify } from '@/shared'
	import { canvasProductsApi } from '../api/products'
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

	const mainCategories = ref<MainCategory[]>([])
	const featuredCategories = ref<FeaturedCategory[]>([])
	const subCategories = ref<SubCategory[]>([])
	const brands = ref<Brand[]>([])
	const banners = ref<Banner[]>([])
	const discounts = ref<Discount[]>([])
	const colors = ref<Color[]>([])
	const canvasFormats = ref<CanvasFormat[]>([])
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
			Object.entries(errors).map(([field, messages]) => [field, messages?.[0] ?? 'Invalid value'])
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
			errors[field] = `${label} is required.`
		}
	}

	const validateForm = () => {
		const errors: Record<string, string> = {}

		setRequiredError(errors, 'name', 'Name')
		setRequiredError(errors, 'slug', 'Slug')
		setRequiredError(errors, 'description', 'Description')
		setRequiredError(errors, 'price', 'Price')
		setRequiredError(errors, 'upload_image_count', 'Upload Image Count')
		setRequiredError(errors, 'flag', 'Flag')
		setRequiredError(errors, 'product_qode', 'Product Qode')
		setRequiredError(errors, 'main_category_id', 'Main Category')
		setRequiredError(errors, 'category_id', 'Category')
		setRequiredError(errors, 'sub_category_id', 'Sub Category')
		setRequiredError(errors, 'brand_id', 'Brand')
		setRequiredError(errors, 'banner_id', 'Banner')
		setRequiredError(errors, 'discount_id', 'Discount')

		if (!Number.isFinite(Number(form.value.price)) || Number(form.value.price) <= 0) {
			errors.price = 'Price must be greater than 0.'
		}

		if (!Number.isFinite(Number(form.value.upload_image_count)) || Number(form.value.upload_image_count) < 0) {
			errors.upload_image_count = 'Upload Image Count must be 0 or greater.'
		}

		if (!form.value.images.length) {
			errors.images = 'Images are required.'
		}

		if (!form.value.colors.length) {
			errors.colors = 'Choose at least one color.'
		}

		if (!form.value.canvas_formats.length) {
			errors.canvas_formats = 'Choose at least one canvas format.'
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
		images: [],
		inner_images: [],
		upload_image_count: 0,
		main_category_id: null,
		category_id: null,
		sub_category_id: null,
		brand_id: null,
		banner_id: null,
		flag: '',
		product_qode: '',
		discount_id: null,
		colors: [],
		canvas_formats: []
	})

	const resetForm = () => {
		form.value = {
			id: null,
			name: '',
			slug: '',
			description: '',
			price: 0,
			images: [],
			inner_images: [],
			upload_image_count: 0,
			main_category_id: null,
			category_id: null,
			sub_category_id: null,
			brand_id: null,
			banner_id: null,
			flag: '',
			product_qode: '',
			discount_id: null,
			colors: [],
			canvas_formats: []
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
				images: product.images || [],
				inner_images: product.inner_images || [],
				upload_image_count: product.upload_image_count ?? 0,
				main_category_id: product.main_category_id ?? null,
				category_id: product.category_id ?? null,
				sub_category_id: product.sub_category_id ?? null,
				brand_id: product.brand_id ?? null,
				banner_id: product.banner_id ?? null,
				flag: product.flag ?? '',
				product_qode: product.product_qode ?? '',
				discount_id: product.discount_id ?? null,
				colors: product.colors || [],
				canvas_formats: product.canvas_formats || []
			}
			nextTick(() => {
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
			const [mainCategoriesResult, brandsResult, bannersResult, discountsResult, colorsResult, canvasFormatsResult] =
				await Promise.all([
					categoriesApi.listMainCategories({ limit: 100, offset: 0 }),
					brandsApi.listBrands({ limit: 100, offset: 0 }),
					bannersApi.listBanners(),
					discountsApi.listDiscounts({ limit: 100, offset: 0 }),
					colorsApi.listColors({ limit: 100, offset: 0 }),
					canvasFormatsApi.listCanvasFormats({ limit: 100, offset: 0 })
				])

			if (requestId !== dictionaryRequestId.value) return

			mainCategories.value = mainCategoriesResult.items || []
			brands.value = brandsResult.items || []
			banners.value = bannersResult || []
			discounts.value = discountsResult.items || []
			colors.value = colorsResult.items || []
			canvasFormats.value = canvasFormatsResult.items || []

			if (form.value.main_category_id) {
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
		product.value = await canvasProductsApi.getCanvasProduct(productId.value)
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

	watch(
		() => form.value.main_category_id,
		(mainCategoryId, oldMainCategoryId) => {
			if (!isApplyingProduct.value && oldMainCategoryId !== undefined && mainCategoryId !== oldMainCategoryId) {
				form.value.category_id = null
				form.value.sub_category_id = null
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

	const onSubmit = async () => {
		validationErrors.value = {}

		if (!validateForm()) {
			toast.error(Object.values(validationErrors.value)[0] || 'Заполните обязательные поля')
			return
		}

		saving.value = true

		try {
			if (product.value?.id) {
				await canvasProductsApi.updateCanvasProduct(form.value)
				toast.success('Продукт успешно обновлен')
			} else {
				await canvasProductsApi.createCanvasProduct(form.value)
				toast.success('Продукт успешно добавлен')
			}

			router.push('/products')
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
				<Button type="button" variant="outline" size="sm" :on-click="() => router.push('/products')">Назад</Button>
			</div>

			<form class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3" @submit.prevent="onSubmit">
				<TextField
					v-model.trim="form.name"
					label="Name *"
					name="name"
					placeholder="Name"
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
					label="Price"
					name="price"
					type="number"
					min="0"
					:error-message="validationErrors.price"
				/>

				<TextField
					v-model.number="form.upload_image_count"
					label="Upload Image Count"
					name="upload_image_count"
					type="number"
					min="0"
					:error-message="validationErrors.upload_image_count"
				/>
				<TextField
					v-model.trim="form.flag"
					label="Flag"
					name="flag"
					placeholder="Flag"
					:error-message="validationErrors.flag"
				/>
				<TextField
					v-model.trim="form.product_qode"
					label="Product Qode"
					name="product_qode"
					placeholder="Product Qode"
					:error-message="validationErrors.product_qode"
				/>

				<div class="md:col-span-3">
					<TextareaField
						v-model.trim="form.description"
						label="Description"
						name="description"
						placeholder="Description"
						:error-message="validationErrors.description"
					/>
				</div>

				<SelectField
					v-model="form.main_category_id"
					label="Main Category"
					name="main_category_id"
					placeholder="Select main category"
					:options="mainCategoryOptions"
					:disabled="loadingDictionaries"
					:error-message="validationErrors.main_category_id"
				/>
				<SelectField
					v-model="form.category_id"
					label="Category"
					name="category_id"
					placeholder="Select category"
					:options="featuredCategoryOptions"
					:disabled="loadingDictionaries || loadingFeaturedCategories || !form.main_category_id"
					:error-message="validationErrors.category_id"
				/>
				<SelectField
					v-model="form.sub_category_id"
					label="Sub Category"
					name="sub_category_id"
					placeholder="Select sub category"
					:options="subCategoryOptions"
					:disabled="loadingDictionaries || loadingSubCategories || !form.category_id"
					:error-message="validationErrors.sub_category_id"
				/>

				<SelectField
					v-model="form.brand_id"
					label="Brand"
					name="brand_id"
					placeholder="Select brand"
					:options="brandOptions"
					:disabled="loadingDictionaries"
					:error-message="validationErrors.brand_id"
				/>
				<SelectField
					v-model="form.banner_id"
					label="Banner"
					name="banner_id"
					placeholder="Select banner"
					:options="bannerOptions"
					:disabled="loadingDictionaries"
					:error-message="validationErrors.banner_id"
				/>
				<SelectField
					v-model="form.discount_id"
					label="Discount"
					name="discount_id"
					placeholder="Select discount"
					:options="discountOptions"
					:disabled="loadingDictionaries"
					:error-message="validationErrors.discount_id"
				/>

				<div class="md:col-span-3">
					<MultiImageUpload
						v-model="form.images"
						label="Images"
						description="Выберите одну или несколько картинок продукта."
						:error-message="validationErrors.images"
						:uploader="(files, onProgress) => canvasProductsApi.uploadImages(files, onProgress)"
					/>
				</div>
				<div v-if="form.main_category_id !== 5" class="md:col-span-3">
					<MultiImageUpload
						v-model="form.inner_images"
						label="Inner Images"
						description="Выберите одну или несколько внутренних картинок продукта."
						:uploader="(files, onProgress) => canvasProductsApi.uploadImages(files, onProgress)"
					/>
				</div>

				<div class="md:col-span-3">
					<SelectField
						:model-value="selectedColorId"
						label="Colors"
						name="colors"
						placeholder="Select color"
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
						label="Canvas Formats"
						name="canvas_formats"
						placeholder="Select canvas format"
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

				<div class="mt-2 flex items-center justify-end gap-3 md:col-span-3">
					<Button type="button" variant="outline" size="sm" :on-click="() => router.push('/products')"> Отмена </Button>
					<Button type="submit" size="sm" :disabled="saving" :loading="saving">
						{{ saving ? 'Сохранение...' : 'Сохранить' }}
					</Button>
				</div>
			</form>
		</div>
	</div>
</template>
