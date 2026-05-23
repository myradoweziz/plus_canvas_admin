<script setup lang="ts">
	import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
	import { toast } from 'vue3-toastify'

	import Banner from '@/shared/ui/Banner.vue'
	import Button from '@/shared/ui/Button.vue'
	import DeleteModal from '@/shared/ui/DeleteModal.vue'
	import Pagination from '@/shared/ui/Pagination.vue'
	import SelectField from '@/shared/ui/SelectField.vue'
	import TextField from '@/shared/ui/TextField.vue'
	import FeaturedCategoriesTable from '../components/FeaturedCategoriesTable.vue'
	import FeaturedCategoryCreateModal from '../components/modal/FeaturedCategoryCreateModal.vue'

	import { debounce } from '@/shared'
	import { FeaturedCategoriesIcon } from '@/shared/icons'
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
	const selectedCategories = ref<FeaturedCategory[]>([])
	const fileInput = ref<HTMLInputElement | null>(null)
	const total = ref(0)
	const limit = ref(10)
	const offset = ref(0)
	const filters = ref({
		search: '',
		main_category_id: null as number | null
	})

	const load = async () => {
		loading.value = true
		try {
			const result = await categoriesApi.listFeaturedCategories({
				name: filters.value.search,
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
		toast.info('Порядок изменён. Сохраняю...')
		try {
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

	const exportXml = async () => {
		try {
			const ids = selectedCategories.value.length ? selectedCategories.value.map((c) => c.id!) : undefined
			await categoriesApi.exportFeaturedCategoriesXml(ids)
			toast.success('XML файл скачан')
		} catch {
			toast.error('Не удалось экспортировать XML')
		}
	}

	const exportExcel = async () => {
		try {
			const ids = selectedCategories.value.length ? selectedCategories.value.map((c) => c.id!) : undefined
			await categoriesApi.exportFeaturedCategoriesExcel(ids)
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
			await categoriesApi.importFeaturedCategoriesExcel(target.files[0])
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
		if (!confirm(`Вы действительно хотите удалить ${selectedCategories.value.length} выбранных категорий?`)) return

		try {
			const ids = selectedCategories.value.map((c) => c.id!)
			await categoriesApi.bulkDeleteFeaturedCategories(ids)
			toast.success('Выбранные категории удалены')
			selectedCategories.value = []
			await load()
		} catch {
			toast.error('Не удалось удалить выбранные категории')
		}
	}
</script>

<template>
	<div class="space-y-6">
		<Banner
			title="Категории"
			subtitle="Список категорий и управление ими."
			:icon="FeaturedCategoriesIcon"
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
				v-model="filters.main_category_id"
				label="Главная категория"
				name="main_category_id"
				placeholder="Выберите главную категорию"
				:options="mainCategoryOptions"
				:disabled="loadingMainCategories"
				remote-search
				@search="searchMainCategories"
			/>

			<div class="flex items-end gap-2">
				<Button type="submit" size="sm">Фильтр</Button>
				<Button type="button" variant="outline" size="sm" :on-click="resetFilters">Сброс</Button>
			</div>
		</form>

		<FeaturedCategoriesTable
			:categories="featuredCategories"
			:loading="loading"
			v-model:selected-categories="selectedCategories"
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
