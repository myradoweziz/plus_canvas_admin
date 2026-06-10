<script setup lang="ts">
	import { defineAsyncComponent, onMounted, ref } from 'vue'
	import { toast } from 'vue3-toastify'

	import { CanvasSizesIcon } from '@/shared/icons'
	import Banner from '@/shared/ui/Banner.vue'
	import Button from '@/shared/ui/Button.vue'
	import DeleteModal from '@/shared/ui/DeleteModal.vue'
	import Pagination from '@/shared/ui/Pagination.vue'
	import TextField from '@/shared/ui/TextField.vue'
	import CanvasSizesTable from '../components/CanvasSizesTable.vue'
	const CanvasSizeCreateModal = defineAsyncComponent(() => import('../components/CanvasSizeCreateModal.vue'))

	import { api } from '../api'
	import type { CanvasSize } from '../types'

	const loading = ref(false)
	const canvasSizes = ref<CanvasSize[]>([])
	const showCanvasSizeModal = ref(false)
	const selectedCanvasSize = ref<CanvasSize | null>(null)
	const showDeleteModal = ref(false)
	const loadingDeleteModal = ref(false)
	const total = ref(0)
	const limit = ref(15)
	const offset = ref(0)
	const filters = ref({
		width: '',
		height: ''
	})

	const load = async () => {
		loading.value = true
		try {
			const result = await api.listCanvasSizes({
				limit: limit.value,
				offset: offset.value,
				...(filters.value.width ? { width: filters.value.width } : {}),
				...(filters.value.height ? { height: filters.value.height } : {})
			})
			canvasSizes.value = result.items
			total.value = result.total
		} finally {
			loading.value = false
		}
	}

	onMounted(load)

	const openCreate = () => {
		selectedCanvasSize.value = null
		showCanvasSizeModal.value = true
	}

	const closeCanvasSizeModal = () => {
		showCanvasSizeModal.value = false
		selectedCanvasSize.value = null
	}

	const editCanvasSize = (canvasSize: CanvasSize) => {
		selectedCanvasSize.value = canvasSize
		showCanvasSizeModal.value = true
	}

	const deleteCanvasSize = (canvasSize: CanvasSize) => {
		selectedCanvasSize.value = canvasSize
		showDeleteModal.value = true
	}

	const confirmDelete = async () => {
		if (!selectedCanvasSize.value?.id) return

		loadingDeleteModal.value = true
		try {
			await api.deleteCanvasSize(selectedCanvasSize.value.id)
			showDeleteModal.value = false
			selectedCanvasSize.value = null
			await load()
		} finally {
			loadingDeleteModal.value = false
		}
	}

	const reorderCanvasSizes = async (orderedCanvasSizes: CanvasSize[]) => {
		toast.info('Порядок изменён. Сохраняю...')
		try {
			canvasSizes.value = orderedCanvasSizes
			await api.reorderCanvasSizes({
				items: orderedCanvasSizes
					.filter((canvasSize): canvasSize is CanvasSize & { id: number } => canvasSize.id !== null)
					.map((canvasSize) => ({
						id: canvasSize.id,
						sort_order: canvasSize.sort_order
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
			width: '',
			height: ''
		}
		limit.value = 15
		offset.value = 0
		await load()
	}

	const changeOffset = async (value: number) => {
		offset.value = value
		await load()
	}

	const getCanvasSizeTitle = (canvasSize: CanvasSize | null) => {
		if (!canvasSize) return ''

		return `${canvasSize.width} x ${canvasSize.height} ${canvasSize.unit}`
	}
</script>

<template>
	<div class="space-y-6">
		<Banner
			title="Размеры холста"
			subtitle="Список размеров холста и управление ими."
			:icon="CanvasSizesIcon"
			:total="total"
		>
			<template #actions>
				<Button type="button" size="sm" :on-click="openCreate">Добавить размер</Button>
			</template>
		</Banner>

		<form
			class="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-4 md:grid-cols-4"
			@submit.prevent="applyFilters"
		>
			<TextField v-model.trim="filters.width" label="Ширина" name="width" placeholder="Ширина" />
			<TextField v-model.trim="filters.height" label="Высота" name="height" placeholder="Высота" />

			<div class="flex items-end gap-2">
				<Button type="submit" size="sm">Фильтр</Button>
				<Button type="button" variant="outline" size="sm" :on-click="resetFilters">Сброс</Button>
			</div>
		</form>

		<CanvasSizesTable
			:canvas-sizes="canvasSizes"
			:loading="loading"
			@edit="editCanvasSize"
			@delete="deleteCanvasSize"
			@reorder="reorderCanvasSizes"
			:pagination="{ limit, offset }"
		/>

		<Pagination :total="total" :limit="limit" :offset="offset" @update:offset="changeOffset" />

		<CanvasSizeCreateModal
			v-if="showCanvasSizeModal"
			:open="showCanvasSizeModal"
			:canvas-size="selectedCanvasSize"
			@close="closeCanvasSizeModal"
			@saved="load"
		/>

		<DeleteModal
			:open="showDeleteModal"
			:title="getCanvasSizeTitle(selectedCanvasSize)"
			entity-name="размер холста"
			:loading="loadingDeleteModal"
			@close="showDeleteModal = false"
			@confirm="confirmDelete"
		/>
	</div>
</template>
