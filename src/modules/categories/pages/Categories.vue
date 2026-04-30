<script setup lang="ts">
	import { onMounted, ref } from 'vue'

	import { CategoriesIcon } from '@/shared/icons'
	import Banner from '@/shared/ui/Banner.vue'
	import DeleteModal from '@/shared/ui/DeleteModal.vue'

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

	const load = async () => {
		loading.value = true
		try {
			categories.value = await categoriesApi.listCategories()
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
			orders: orderedCategories
				.filter((category): category is Category & { id: number } => category.id !== null)
				.map((category) => ({
					id: category.id,
					featured_order: category.featured_order
				}))
		})
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

		<CategoriesTable
			:categories="categories"
			:loading="loading"
			@edit="editCategory"
			@delete="deleteCategory"
			@reorder="reorderCategories"
		/>

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
