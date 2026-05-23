<script setup lang="ts">
	import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
	import { toast } from 'vue3-toastify'

	import Banner from '@/shared/ui/Banner.vue'
	import Button from '@/shared/ui/Button.vue'
	import DeleteModal from '@/shared/ui/DeleteModal.vue'
	import Pagination from '@/shared/ui/Pagination.vue'
	import SelectField from '@/shared/ui/SelectField.vue'
	import TextField from '@/shared/ui/TextField.vue'
	import SubCategoriesTable from '../components/SubCategoriesTable.vue'
	import SubCategoryCreateModal from '../components/modal/SubCategoryCreateModal.vue'

	import { debounce } from '@/shared'
	import { SubCategoriesIcon } from '@/shared/icons'
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
	const selectedCategories = ref<SubCategory[]>([])
	const fileInput = ref<HTMLInputElement | null>(null)
	const total = ref(0)
	const limit = ref(10)
	const offset = ref(0)
	const filters = ref({
		search: '',
		category_id: null as number | null
	})

	const load = async () => {
		loading.value = true
		try {
			const result = await categoriesApi.listSubCategories({
				name: filters.value.search,
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
		toast.info('Порядок изменён. Сохраняю...')
		try {
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
			toast.success('Порядок сохранён')
		} catch (e) {
			toast.error('Не удалось сохранить порядок')
			await load()
		}
	}

	const applyFilters = async () => {
		offset.value = 0
		await load()
	}

	const resetFilters = async () => {
		filters.value = {
			search: '',
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

	const exportXml = async () => {
		try {
			const ids = selectedCategories.value.length ? selectedCategories.value.map((c) => c.id!) : undefined
			await categoriesApi.exportSubCategoriesXml(ids)
			toast.success('XML файл скачан')
		} catch {
			toast.error('Не удалось экспортировать XML')
		}
	}

	const exportExcel = async () => {
		try {
			const ids = selectedCategories.value.length ? selectedCategories.value.map((c) => c.id!) : undefined
			await categoriesApi.exportSubCategoriesExcel(ids)
			toast.success('Excel файл скачан')
		} catch {
			toast.error('Не удалось экспортировать Excel')
		}
	}

	const triggerImportExcel = () => {
		fileInput.value?.click()
	}

	const importExcel = async (event: Event) => {
		const target = event.target as HTMLInputElement
		if (!target.files?.length) return

		try {
			await categoriesApi.importSubCategoriesExcel(target.files[0])
			toast.success('Excel файл успешно импортирован')
			await load()
		} catch {
			toast.error('Не удалось импортировать Excel')
		} finally {
			if (fileInput.value) {
				fileInput.value.value = ''
			}
		}
	}

	const bulkDelete = async () => {
		if (!selectedCategories.value.length) return
		if (!confirm(`Вы действительно хотите удалить ${selectedCategories.value.length} выбранных подкатегорий?`)) return

		try {
			const ids = selectedCategories.value.map((c) => c.id!)
			await categoriesApi.bulkDeleteSubCategories(ids)
			toast.success('Выбранные подкатегории удалены')
			selectedCategories.value = []
			await load()
		} catch {
			toast.error('Не удалось удалить выбранные подкатегории')
		}
	}
</script>

<template>
	<div class="space-y-6">
		<Banner
			title="Подкатегории"
			subtitle="Список подкатегорий и управление ими."
			:icon="SubCategoriesIcon"
			:total="total"
		>
			<template #actions>
				<div class="flex items-center gap-2 flex-wrap">
					<input type="file" ref="fileInput" class="hidden" accept=".xlsx,.xls" @change="importExcel" />
					<Button v-if="selectedCategories.length" type="button" size="sm" class="bg-red-600 hover:bg-red-700 text-white" :on-click="bulkDelete">Удалить выбранные ({{ selectedCategories.length }})</Button>
					<Button type="button" size="sm" variant="outline" :on-click="triggerImportExcel">Импорт Excel</Button>
					<Button type="button" size="sm" variant="outline" :on-click="exportExcel">Экспорт Excel</Button>
					<Button type="button" size="sm" variant="outline" :on-click="exportXml">Экспорт XML</Button>
					<Button type="button" size="sm" :on-click="openCreate">Добавить</Button>
				</div>
			</template>
		</Banner>

		<form
			class="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-4 md:grid-cols-4"
			@submit.prevent="applyFilters"
		>
			<TextField v-model.trim="filters.search" label="Поиск" name="search" placeholder="Поиск" />
			<SelectField
				v-model="filters.category_id"
				label="Категория"
				name="category_id"
				placeholder="Выберите категорию"
				:options="featuredCategoryOptions"
				:disabled="loadingFeaturedCategories"
				remote-search
				@search="searchFeaturedCategories"
			/>

			<div class="flex items-end gap-2">
				<Button type="submit" size="sm">Фильтр</Button>
				<Button type="button" variant="outline" size="sm" :on-click="resetFilters">Сброс</Button>
			</div>
		</form>

		<SubCategoriesTable
			:categories="subCategories"
			:loading="loading"
			v-model:selected-categories="selectedCategories"
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
