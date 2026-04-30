<script setup lang="ts">
	import { onMounted, ref } from 'vue'

	import { CategoriesIcon } from '@/shared/icons'
	import Banner from '@/shared/ui/Banner.vue'
	import DeleteModal from '@/shared/ui/DeleteModal.vue'
	import Pagination from '@/shared/ui/Pagination.vue'
	import TextField from '@/shared/ui/TextField.vue'

	import { categoriesApi } from '../api/categories'
	import CategoriesTable from '../components/CategoriesTable.vue'
	import CategoryCreateModal from '../components/CategoryCreateModal.vue'
	import type { Category } from '../types/category'

	const loading = ref(false)
	const categories = ref<Category[]>([])
	const showCategoryModal = ref(false)
	const selectedCategory = ref<Category | null>(null)
	const showDeleteModal = ref(false)
	const loadingDeleteModal = ref(false)
	const total = ref(0)
	const limit = ref(10)
	const offset = ref(0)
	const filters = ref({
		name: '',
		featured_order: ''
	})

	const load = async () => {
		loading.value = true
		try {
			const result = await categoriesApi.listCategories({
				name: filters.value.name,
				featured_order: filters.value.featured_order === '' ? undefined : Number(filters.value.featured_order),
				limit: limit.value,
				offset: offset.value
			})
			categories.value = result.items
			total.value = result.total
		} finally {
			loading.value = false
		}
	}

	onMounted(load)

	const openCreate = () => {
		selectedCategory.value = null
		showCategoryModal.value = true
	}

	const closeCategoryModal = () => {
		showCategoryModal.value = false
		selectedCategory.value = null
	}

	const editCategory = (category: Category) => {
		selectedCategory.value = category
		showCategoryModal.value = true
	}

	const deleteCategory = (category: Category) => {
		selectedCategory.value = category
		showDeleteModal.value = true
	}

	const confirmDelete = async () => {
		if (!selectedCategory.value?.id) return

		loadingDeleteModal.value = true
		try {
			await categoriesApi.deleteCategory(selectedCategory.value.id)
			showDeleteModal.value = false
			selectedCategory.value = null
			await load()
		} finally {
			loadingDeleteModal.value = false
		}
	}

	const reorderCategories = async (orderedCategories: Category[]) => {
		categories.value = orderedCategories
		await categoriesApi.reorderCategories({
			items: orderedCategories
				.filter((category): category is Category & { id: number } => category.id !== null)
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
			featured_order: ''
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

		<CategoriesTable
			:categories="categories"
			:loading="loading"
			@edit="editCategory"
			@delete="deleteCategory"
			@reorder="reorderCategories"
		/>

		<Pagination :total="total" :limit="limit" :offset="offset" @update:offset="changeOffset" />

		<CategoryCreateModal
			:open="showCategoryModal"
			:category="selectedCategory"
			@close="closeCategoryModal"
			@saved="load"
		/>

		<DeleteModal
			:open="showDeleteModal"
			:title="selectedCategory?.name"
			entity-name="категорию"
			:loading="loadingDeleteModal"
			@close="showDeleteModal = false"
			@confirm="confirmDelete"
		/>
	</div>
</template>

<style lang="scss" scoped></style>
