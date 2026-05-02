<script setup lang="ts">
	import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

	import { CategoriesIcon } from '@/shared/icons'
	import Banner from '@/shared/ui/Banner.vue'
	import DeleteModal from '@/shared/ui/DeleteModal.vue'
	import Pagination from '@/shared/ui/Pagination.vue'
	import SelectField from '@/shared/ui/SelectField.vue'
	import TextField from '@/shared/ui/TextField.vue'
	import FeaturedCategoriesTable from '../components/FeaturedCategoriesTable.vue'
	import FeaturedCategoryCreateModal from '../components/FeaturedCategoryCreateModal.vue'

	import { debounce } from '@/shared'
	import { categoriesApi } from '../api'
	import type { FeaturedCategory, MainCategory } from '../types/category'

	const loading = ref(false)
	const featuredCategories = ref<FeaturedCategory[]>([])
	const showFeaturedCategoryModal = ref(false)
	const selectedFeaturedCategory = ref<FeaturedCategory | null>(null)
	const showDeleteModal = ref(false)
	const loadingDeleteModal = ref(false)
	const loadingMainCategories = ref(false)
	const mainCategories = ref<MainCategory[]>([])
	const mainCategoriesRequestId = ref(0)
	const total = ref(0)
	const limit = ref(10)
	const offset = ref(0)
	const filters = ref({
		name: '',
		featured_order: '',
		main_category_id: null as number | null
	})

	const load = async () => {
		loading.value = true
		try {
			const result = await categoriesApi.listFeaturedCategories({
				name: filters.value.name,
				featured_order: filters.value.featured_order === '' ? undefined : Number(filters.value.featured_order),
				main_category_id: filters.value.main_category_id ?? undefined,
				limit: limit.value,
				offset: offset.value
			})
			featuredCategories.value = result.items
			total.value = result.total
		} finally {
			loading.value = false
		}
	}

	const mainCategoryOptions = computed(() =>
		mainCategories.value
			.filter((category): category is MainCategory & { id: number } => category.id !== null)
			.map((category) => ({
				label: category.name,
				value: category.id
			}))
	)

	const loadMainCategories = async (name = '') => {
		const requestId = mainCategoriesRequestId.value + 1
		mainCategoriesRequestId.value = requestId
		loadingMainCategories.value = true
		try {
			const result = await categoriesApi.listMainCategories({
				name: name || undefined,
				limit: 100,
				offset: 0
			})

			if (requestId !== mainCategoriesRequestId.value) return
			mainCategories.value = result.items || []
		} finally {
			if (requestId === mainCategoriesRequestId.value) {
				loadingMainCategories.value = false
			}
		}
	}

	const searchMainCategories = debounce((name: string) => {
		loadMainCategories(name)
	}, 300)

	onMounted(() => {
		load()
		loadMainCategories()
	})

	onBeforeUnmount(searchMainCategories.cancel)

	const openCreate = () => {
		selectedFeaturedCategory.value = null
		showFeaturedCategoryModal.value = true
	}

	const closeFeaturedCategoryModal = () => {
		showFeaturedCategoryModal.value = false
		selectedFeaturedCategory.value = null
	}

	const editFeaturedCategory = (category: FeaturedCategory) => {
		selectedFeaturedCategory.value = category
		showFeaturedCategoryModal.value = true
	}

	const deleteFeaturedCategory = (category: FeaturedCategory) => {
		selectedFeaturedCategory.value = category
		showDeleteModal.value = true
	}

	const confirmDelete = async () => {
		if (!selectedFeaturedCategory.value?.id) return

		loadingDeleteModal.value = true
		try {
			await categoriesApi.deleteFeaturedCategory(selectedFeaturedCategory.value.id)
			showDeleteModal.value = false
			selectedFeaturedCategory.value = null
			await load()
		} finally {
			loadingDeleteModal.value = false
		}
	}

	const reorderFeaturedCategories = async (orderedCategories: FeaturedCategory[]) => {
		featuredCategories.value = orderedCategories
		await categoriesApi.reorderFeaturedCategories({
			items: orderedCategories
				.filter((category): category is FeaturedCategory & { id: number } => category.id !== null)
				.map((category) => ({
					id: category.id,
					featured_order: category.featured_order
				}))
		})
		await load()
	}

	const applyFilters = async () => {
		offset.value = 0
		await load()
	}

	const resetFilters = async () => {
		filters.value = {
			name: '',
			featured_order: '',
			main_category_id: null
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
		<Banner title="Категории" subtitle="Список категорий и управление ими." :icon="CategoriesIcon">
			<template #actions>
				<button
					type="button"
					class="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
					@click="openCreate"
				>
					Добавить категорию
				</button>
			</template>
		</Banner>

		<form
			class="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-4 md:grid-cols-4"
			@submit.prevent="applyFilters"
		>
			<TextField v-model.trim="filters.name" label="Search by name" name="name" placeholder="Name" />
			<SelectField
				v-model="filters.main_category_id"
				label="Main Category"
				name="main_category_id"
				placeholder="Select main category"
				:options="mainCategoryOptions"
				:disabled="loadingMainCategories"
				remote-search
				@search="searchMainCategories"
			/>
			<TextField
				v-model.number="filters.featured_order"
				label="Featured Order"
				name="featured_order"
				type="number"
				min="0"
			/>

			<div class="flex items-end gap-2">
				<button
					type="submit"
					class="h-12 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
				>
					Фильтр
				</button>
				<button
					type="button"
					class="h-12 rounded-xl px-4 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-200 hover:bg-gray-50"
					@click="resetFilters"
				>
					Сброс
				</button>
			</div>
		</form>

		<FeaturedCategoriesTable
			:categories="featuredCategories"
			:loading="loading"
			@edit="editFeaturedCategory"
			@delete="deleteFeaturedCategory"
			@reorder="reorderFeaturedCategories"
		/>

		<Pagination :total="total" :limit="limit" :offset="offset" @update:offset="changeOffset" />

		<FeaturedCategoryCreateModal
			:open="showFeaturedCategoryModal"
			:category="selectedFeaturedCategory"
			@close="closeFeaturedCategoryModal"
			@saved="load"
		/>

		<DeleteModal
			:open="showDeleteModal"
			:title="selectedFeaturedCategory?.name"
			entity-name="категорию"
			:loading="loadingDeleteModal"
			@close="showDeleteModal = false"
			@confirm="confirmDelete"
		/>
	</div>
</template>

<style lang="scss" scoped></style>
