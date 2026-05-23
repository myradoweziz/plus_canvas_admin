<script setup lang="ts">
	import { onMounted, ref } from 'vue'
	import { toast } from 'vue3-toastify'

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
	const selectedCategories = ref<MainCategory[]>([])
	const fileInput = ref<HTMLInputElement | null>(null)
	const total = ref(0)
	const limit = ref(10)
	const offset = ref(0)
	const filters = ref({
		search: ''
	})

	const load = async () => {
		loading.value = true
		try {
			const result = await categoriesApi.listMainCategories({
				name: filters.value.search,
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
		toast.info('Порядок изменён. Сохраняю...')
		try {
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
			search: ''
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
			await categoriesApi.exportMainCategoriesXml(ids)
			toast.success('XML файл скачан')
		} catch {
			toast.error('Не удалось экспортировать XML')
		}
	}

	const exportExcel = async () => {
		try {
			const ids = selectedCategories.value.length ? selectedCategories.value.map((c) => c.id!) : undefined
			await categoriesApi.exportMainCategoriesExcel(ids)
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
			await categoriesApi.importMainCategoriesExcel(target.files[0])
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
			await categoriesApi.bulkDeleteMainCategories(ids)
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
			title="Главные категории"
			subtitle="Список главных категорий и управление ими."
			:icon="CategoriesIcon"
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

			<div class="flex items-end gap-2">
				<Button type="submit" size="sm">Фильтр</Button>
				<Button type="button" variant="outline" size="sm" :on-click="resetFilters">Сброс</Button>
			</div>
		</form>

		<MainCategoriesTable
			:categories="mainCategories"
			:loading="loading"
			v-model:selected-categories="selectedCategories"
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
