<script setup lang="ts">
	import { computed, onMounted, ref, watch } from 'vue'
	import { useRouter } from 'vue-router'

	import Banner from '@/shared/ui/Banner.vue'
	import Button from '@/shared/ui/Button.vue'
	import DeleteModal from '@/shared/ui/DeleteModal.vue'
	import Pagination from '@/shared/ui/Pagination.vue'
	import SelectField from '@/shared/ui/SelectField.vue'
	import TextField from '@/shared/ui/TextField.vue'
	import ProductsTable from '../components/ProductsTable.vue'

	import { brandsApi } from '@/modules/brands/api/brands'
	import type { Brand } from '@/modules/brands/types/brand'
	import { categoriesApi } from '@/modules/categories/api'
	import type { FeaturedCategory, MainCategory, SubCategory } from '@/modules/categories/types/category'
	import { BoxCubeIcon } from '@/shared/icons'
	import { canvasProductsApi } from '../api/products'
	import type { CanvasProduct } from '../types/product'

	const router = useRouter()
	const loading = ref(false)
	const products = ref<CanvasProduct[]>([])
	const selectedProduct = ref<CanvasProduct | null>(null)
	const showDeleteModal = ref(false)
	const loadingDeleteModal = ref(false)
	const total = ref(0)
	const limit = ref(10)
	const offset = ref(0)
	const filters = ref({
		search: '',
		main_category_id: null as number | null,
		category_id: null as number | null,
		sub_category_id: null as number | null,
		brand_id: null as number | null
	})

	const loadingDictionaries = ref(false)
	const loadingFeaturedCategories = ref(false)
	const loadingSubCategories = ref(false)
	const dictionaryRequestId = ref(0)
	const featuredCategoriesRequestId = ref(0)
	const subCategoriesRequestId = ref(0)

	const mainCategories = ref<MainCategory[]>([])
	const featuredCategories = ref<FeaturedCategory[]>([])
	const subCategories = ref<SubCategory[]>([])
	const brands = ref<Brand[]>([])

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

	const load = async () => {
		loading.value = true
		try {
			const result = await canvasProductsApi.listCanvasProducts({
				name: filters.value.search,
				main_category_id: filters.value.main_category_id ?? undefined,
				category_id: filters.value.category_id ?? undefined,
				sub_category_id: filters.value.sub_category_id ?? undefined,
				brand_id: filters.value.brand_id ?? undefined,
				limit: limit.value,
				offset: offset.value
			})
			products.value = result.items
			total.value = result.total
		} finally {
			loading.value = false
		}
	}

	const loadDictionaries = async () => {
		const requestId = dictionaryRequestId.value + 1
		dictionaryRequestId.value = requestId
		loadingDictionaries.value = true

		try {
			const [mainCategoriesResult, brandsResult] = await Promise.all([
				categoriesApi.listMainCategories({ limit: 100, offset: 0 }),
				brandsApi.listBrands({ limit: 100, offset: 0 })
			])

			if (requestId !== dictionaryRequestId.value) return
			mainCategories.value = mainCategoriesResult.items || []
			brands.value = brandsResult.items || []
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

	watch(
		() => filters.value.main_category_id,
		(mainCategoryId, oldMainCategoryId) => {
			if (oldMainCategoryId !== undefined && mainCategoryId !== oldMainCategoryId) {
				filters.value.category_id = null
				filters.value.sub_category_id = null
			}

			featuredCategories.value = []
			subCategories.value = []
			if (mainCategoryId) loadFeaturedCategories(mainCategoryId)
		}
	)

	watch(
		() => filters.value.category_id,
		(categoryId, oldCategoryId) => {
			if (oldCategoryId !== undefined && categoryId !== oldCategoryId) {
				filters.value.sub_category_id = null
			}

			subCategories.value = []
			if (categoryId) loadSubCategories(categoryId)
		}
	)

	onMounted(async () => {
		await loadDictionaries()
		await load()
	})

	const openCreate = () => {
		router.push('/products/create')
	}

	const editProduct = (product: CanvasProduct) => {
		if (!product.id) return
		router.push(`/products/${product.id}/edit`)
	}

	const deleteProduct = (product: CanvasProduct) => {
		selectedProduct.value = product
		showDeleteModal.value = true
	}

	const confirmDelete = async () => {
		if (!selectedProduct.value?.id) return

		loadingDeleteModal.value = true
		try {
			await canvasProductsApi.deleteCanvasProduct(selectedProduct.value.id)
			showDeleteModal.value = false
			selectedProduct.value = null
			await load()
		} finally {
			loadingDeleteModal.value = false
		}
	}

	const applyFilters = async () => {
		offset.value = 0
		await load()
	}

	const resetFilters = async () => {
		filters.value = {
			search: '',
			main_category_id: null,
			category_id: null,
			sub_category_id: null,
			brand_id: null
		}
		limit.value = 10
		offset.value = 0
		await load()
	}

	const changeOffset = async (value: number) => {
		offset.value = value
		await load()
	}
</script>

<template>
	<div class="space-y-6">
		<Banner title="Продукты" subtitle="Список canvas products и управление ими." :icon="BoxCubeIcon">
			<template #actions>
				<Button type="button" size="sm" :on-click="openCreate">Добавить продукт</Button>
			</template>
		</Banner>

		<form
			class="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-4 md:grid-cols-4"
			@submit.prevent="applyFilters"
		>
			<TextField v-model.trim="filters.search" label="Поиск" name="search" placeholder="Поиск" />
			<SelectField
				v-model="filters.main_category_id"
				label="Главная категория"
				name="main_category_id"
				placeholder="Выберите главную категорию"
				:options="mainCategoryOptions"
				:disabled="loadingDictionaries"
			/>
			<SelectField
				v-model="filters.category_id"
				label="Категория"
				name="category_id"
				placeholder="Выберите категорию"
				:options="featuredCategoryOptions"
				:disabled="loadingDictionaries || loadingFeaturedCategories || !filters.main_category_id"
			/>
			<SelectField
				v-model="filters.sub_category_id"
				label="Подкатегория"
				name="sub_category_id"
				placeholder="Выберите подкатегорию"
				:options="subCategoryOptions"
				:disabled="loadingDictionaries || loadingSubCategories || !filters.category_id"
			/>
			<SelectField
				v-model="filters.brand_id"
				label="Бренд"
				name="brand_id"
				placeholder="Выберите бренд"
				:options="brandOptions"
				:disabled="loadingDictionaries"
			/>

			<div class="flex items-end gap-2">
				<Button type="submit" size="sm">Фильтр</Button>
				<Button type="button" variant="outline" size="sm" :on-click="resetFilters">Сброс</Button>
			</div>
		</form>

		<ProductsTable :products="products" :loading="loading" @edit="editProduct" @delete="deleteProduct" />

		<Pagination :total="total" :limit="limit" :offset="offset" @update:offset="changeOffset" />

		<DeleteModal
			:open="showDeleteModal"
			:title="selectedProduct?.name"
			entity-name="продукт"
			:loading="loadingDeleteModal"
			@close="showDeleteModal = false"
			@confirm="confirmDelete"
		/>
	</div>
</template>
