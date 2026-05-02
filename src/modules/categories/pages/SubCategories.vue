<script setup lang="ts">
	import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

	import { debounce } from '@/shared'
	import { CategoriesIcon } from '@/shared/icons'
	import Banner from '@/shared/ui/Banner.vue'
	import DeleteModal from '@/shared/ui/DeleteModal.vue'
	import Pagination from '@/shared/ui/Pagination.vue'
	import SelectField from '@/shared/ui/SelectField.vue'
	import TextField from '@/shared/ui/TextField.vue'
	import SubCategoriesTable from '../components/SubCategoriesTable.vue'
	import SubCategoryCreateModal from '../components/SubCategoryCreateModal.vue'

	import { categoriesApi } from '../api'
	import type { FeaturedCategory, SubCategory } from '../types/category'

	const loading = ref(false)
	const subCategories = ref<SubCategory[]>([])
	const showSubCategoryModal = ref(false)
	const selectedSubCategory = ref<SubCategory | null>(null)
	const showDeleteModal = ref(false)
	const loadingDeleteModal = ref(false)
	const loadingFeaturedCategories = ref(false)
	const featuredCategories = ref<FeaturedCategory[]>([])
	const featuredCategoriesRequestId = ref(0)
	const total = ref(0)
	const limit = ref(10)
	const offset = ref(0)
	const filters = ref({
		name: '',
		featured_order: '',
		category_id: null as number | null
	})

	const load = async () => {
		loading.value = true
		try {
			const result = await categoriesApi.listSubCategories({
				name: filters.value.name,
				featured_order: filters.value.featured_order === '' ? undefined : Number(filters.value.featured_order),
				category_id: filters.value.category_id ?? undefined,
				limit: limit.value,
				offset: offset.value
			})
			subCategories.value = result.items
			total.value = result.total
		} finally {
			loading.value = false
		}
	}

	const featuredCategoryOptions = computed(() =>
		featuredCategories.value
			.filter((category: FeaturedCategory): category is FeaturedCategory & { id: number } => category.id !== null)
			.map((category: FeaturedCategory) => ({
				label: category.name,
				value: category.id
			}))
	)

	const loadFeaturedCategories = async (name = '') => {
		const requestId = featuredCategoriesRequestId.value + 1
		featuredCategoriesRequestId.value = requestId
		loadingFeaturedCategories.value = true
		try {
			const result = await categoriesApi.listFeaturedCategories({
				name: name || undefined,
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

	const searchFeaturedCategories = debounce((name: string) => {
		loadFeaturedCategories(name)
	}, 300)

	onMounted(() => {
		load()
		loadFeaturedCategories()
	})

	onBeforeUnmount(searchFeaturedCategories.cancel)

	const openCreate = () => {
		selectedSubCategory.value = null
		showSubCategoryModal.value = true
	}

	const closeSubCategoryModal = () => {
		showSubCategoryModal.value = false
		selectedSubCategory.value = null
	}

	const editSubCategory = (subCategory: SubCategory) => {
		selectedSubCategory.value = subCategory
		showSubCategoryModal.value = true
	}

	const deleteSubCategory = (subCategory: SubCategory) => {
		selectedSubCategory.value = subCategory
		showDeleteModal.value = true
	}

	const confirmDelete = async () => {
		if (!selectedSubCategory.value?.id) return

		loadingDeleteModal.value = true
		try {
			await categoriesApi.deleteSubCategory(selectedSubCategory.value.id)
			showDeleteModal.value = false
			selectedSubCategory.value = null
			await load()
		} finally {
			loadingDeleteModal.value = false
		}
	}

	const reorderSubCategories = async (orderedSubCategories: SubCategory[]) => {
		subCategories.value = orderedSubCategories
		await categoriesApi.reorderSubCategories({
			items: orderedSubCategories
				.filter((subCategory): subCategory is SubCategory & { id: number } => subCategory.id !== null)
				.map((subCategory) => ({
					id: subCategory.id,
					featured_order: subCategory.featured_order
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
			category_id: null
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
					Добавить подкатегорию
				</button>
			</template>
		</Banner>

		<form
			class="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-4 md:grid-cols-4"
			@submit.prevent="applyFilters"
		>
			<TextField v-model.trim="filters.name" label="Search by name" name="name" placeholder="Name" />
			<SelectField
				v-model="filters.category_id"
				label="Category"
				name="category_id"
				placeholder="Select category"
				:options="featuredCategoryOptions"
				:disabled="loadingFeaturedCategories"
				remote-search
				@search="searchFeaturedCategories"
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

		<SubCategoriesTable
			:categories="subCategories"
			:loading="loading"
			@edit="editSubCategory"
			@delete="deleteSubCategory"
			@reorder="reorderSubCategories"
		/>

		<Pagination :total="total" :limit="limit" :offset="offset" @update:offset="changeOffset" />

		<SubCategoryCreateModal
			:open="showSubCategoryModal"
			:category="selectedSubCategory"
			@close="closeSubCategoryModal"
			@saved="load"
		/>

		<DeleteModal
			:open="showDeleteModal"
			:title="selectedSubCategory?.name"
			entity-name="подкатегорию"
			:loading="loadingDeleteModal"
			@close="showDeleteModal = false"
			@confirm="confirmDelete"
		/>
	</div>
</template>

<style lang="scss" scoped></style>
