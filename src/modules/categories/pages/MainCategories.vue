<script setup lang="ts">
	import { onMounted, ref } from 'vue'

	import Banner from '@/shared/ui/Banner.vue'
	import Button from '@/shared/ui/Button.vue'
	import DeleteModal from '@/shared/ui/DeleteModal.vue'
	import Pagination from '@/shared/ui/Pagination.vue'
	import TextField from '@/shared/ui/TextField.vue'
	import MainCategoriesTable from '../components/MainCategoriesTable.vue'
	import MainCategoryCreateModal from '../components/modal/MainCategoryCreateModal.vue'

	import { CategoriesIcon } from '@/shared/icons'
	import { categoriesApi } from '../api'
	import type { MainCategory } from '../types/category'

	const loading = ref(false)
	const mainCategories = ref<MainCategory[]>([])
	const showMainCategoryModal = ref(false)
	const selectedMainCategory = ref<MainCategory | null>(null)
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
			const result = await categoriesApi.listMainCategories({
				name: filters.value.name,
				featured_order: filters.value.featured_order === '' ? undefined : Number(filters.value.featured_order),
				limit: limit.value,
				offset: offset.value
			})
			mainCategories.value = result.items
			total.value = result.total
		} finally {
			loading.value = false
		}
	}

	onMounted(load)

	const openCreate = () => {
		selectedMainCategory.value = null
		showMainCategoryModal.value = true
	}

	const closeMainCategoryModal = () => {
		showMainCategoryModal.value = false
		selectedMainCategory.value = null
	}

	const editMainCategory = (category: MainCategory) => {
		selectedMainCategory.value = category
		showMainCategoryModal.value = true
	}

	const deleteMainCategory = (category: MainCategory) => {
		selectedMainCategory.value = category
		showDeleteModal.value = true
	}

	const confirmDelete = async () => {
		if (!selectedMainCategory.value?.id) return

		loadingDeleteModal.value = true
		try {
			await categoriesApi.deleteMainCategory(selectedMainCategory.value.id)
			showDeleteModal.value = false
			selectedMainCategory.value = null
			await load()
		} finally {
			loadingDeleteModal.value = false
		}
	}

	const reorderMainCategories = async (orderedCategories: MainCategory[]) => {
		mainCategories.value = orderedCategories
		await categoriesApi.reorderMainCategories({
			items: orderedCategories
				.filter((category): category is MainCategory & { id: number } => category.id !== null)
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
				<Button type="button" size="sm" :on-click="openCreate">Добавить главную категорию</Button>
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
				<Button type="submit" size="sm">Фильтр</Button>
				<Button type="button" variant="outline" size="sm" :on-click="resetFilters">Сброс</Button>
			</div>
		</form>

		<MainCategoriesTable
			:categories="mainCategories"
			:loading="loading"
			@edit="editMainCategory"
			@delete="deleteMainCategory"
			@reorder="reorderMainCategories"
		/>

		<Pagination :total="total" :limit="limit" :offset="offset" @update:offset="changeOffset" />

		<MainCategoryCreateModal
			:open="showMainCategoryModal"
			:category="selectedMainCategory"
			@close="closeMainCategoryModal"
			@saved="load"
		/>

		<DeleteModal
			:open="showDeleteModal"
			:title="selectedMainCategory?.name"
			entity-name="категорию"
			:loading="loadingDeleteModal"
			@close="showDeleteModal = false"
			@confirm="confirmDelete"
		/>
	</div>
</template>

<style lang="scss" scoped></style>
