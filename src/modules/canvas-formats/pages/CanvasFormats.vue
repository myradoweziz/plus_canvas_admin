<script setup lang="ts">
	import { onMounted, ref } from 'vue'
	import { toast } from 'vue3-toastify'

	import { CanvasFormatsIcon } from '@/shared/icons'
	import Banner from '@/shared/ui/Banner.vue'
	import Button from '@/shared/ui/Button.vue'
	import DeleteModal from '@/shared/ui/DeleteModal.vue'
	import Pagination from '@/shared/ui/Pagination.vue'
	import TextField from '@/shared/ui/TextField.vue'

	import { canvasFormatsApi } from '../api/canvas-formats'
	import CanvasFormatCreateModal from '../components/CanvasFormatCreateModal.vue'
	import CanvasFormatsTable from '../components/CanvasFormatsTable.vue'
	import type { CanvasFormat } from '../types/canvas-format'

	const loading = ref(false)
	const canvasFormats = ref<CanvasFormat[]>([])
	const showCanvasFormatModal = ref(false)
	const selectedCanvasFormat = ref<CanvasFormat | null>(null)
	const showDeleteModal = ref(false)
	const loadingDeleteModal = ref(false)
	const total = ref(0)
	const limit = ref(10)
	const offset = ref(0)
	const filters = ref({
		search: ''
	})

	const load = async () => {
		loading.value = true
		try {
			const result = await canvasFormatsApi.listCanvasFormats({
				name: filters.value.search,
				limit: limit.value,
				offset: offset.value
			})
			canvasFormats.value = result.items
			total.value = result.total
		} finally {
			loading.value = false
		}
	}

	onMounted(load)

	const openCreate = () => {
		selectedCanvasFormat.value = null
		showCanvasFormatModal.value = true
	}

	const closeCanvasFormatModal = () => {
		showCanvasFormatModal.value = false
		selectedCanvasFormat.value = null
	}

	const editCanvasFormat = (canvasFormat: CanvasFormat) => {
		selectedCanvasFormat.value = canvasFormat
		showCanvasFormatModal.value = true
	}

	const deleteCanvasFormat = (canvasFormat: CanvasFormat) => {
		selectedCanvasFormat.value = canvasFormat
		showDeleteModal.value = true
	}

	const confirmDelete = async () => {
		if (!selectedCanvasFormat.value?.id) return

		loadingDeleteModal.value = true
		try {
			await canvasFormatsApi.deleteCanvasFormat(selectedCanvasFormat.value.id)
			showDeleteModal.value = false
			selectedCanvasFormat.value = null
			await load()
		} finally {
			loadingDeleteModal.value = false
		}
	}

	const reorderCanvasFormats = async (orderedCanvasFormats: CanvasFormat[]) => {
		toast.info('Порядок изменён. Сохраняю...')
		try {
			canvasFormats.value = orderedCanvasFormats
			await canvasFormatsApi.reorderCanvasFormats({
				items: orderedCanvasFormats
					.filter((canvasFormat): canvasFormat is CanvasFormat & { id: number } => canvasFormat.id !== null)
					.map((canvasFormat) => ({
						id: canvasFormat.id,
						sort_order: canvasFormat.sort_order
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
</script>

<template>
	<div class="space-y-6">
		<Banner title="Форматы холста" subtitle="Список форматов холста и управление ими." :icon="CanvasFormatsIcon">
			<template #actions>
				<Button type="button" size="sm" :on-click="openCreate">Добавить формат</Button>
			</template>
		</Banner>

		<form
			class="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-4 md:grid-cols-4"
			@submit.prevent="applyFilters"
		>
			<TextField v-model.trim="filters.search" label="Search" name="search" placeholder="Search" />

			<div class="flex items-end gap-2">
				<Button type="submit" size="sm">Фильтр</Button>
				<Button type="button" variant="outline" size="sm" :on-click="resetFilters">Сброс</Button>
			</div>
		</form>

		<CanvasFormatsTable
			:canvas-formats="canvasFormats"
			:loading="loading"
			@edit="editCanvasFormat"
			@delete="deleteCanvasFormat"
			@reorder="reorderCanvasFormats"
		/>

		<Pagination :total="total" :limit="limit" :offset="offset" @update:offset="changeOffset" />

		<CanvasFormatCreateModal
			:open="showCanvasFormatModal"
			:canvas-format="selectedCanvasFormat"
			@close="closeCanvasFormatModal"
			@saved="load"
		/>

		<DeleteModal
			:open="showDeleteModal"
			:title="selectedCanvasFormat?.name"
			entity-name="формат холста"
			:loading="loadingDeleteModal"
			@close="showDeleteModal = false"
			@confirm="confirmDelete"
		/>
	</div>
</template>
