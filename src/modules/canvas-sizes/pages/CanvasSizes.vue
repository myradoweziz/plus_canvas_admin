<script setup lang="ts">
	import { onMounted, ref } from 'vue'
	import { toast } from 'vue3-toastify'

	import { CanvasSizesIcon } from '@/shared/icons'
	import Banner from '@/shared/ui/Banner.vue'
	import Button from '@/shared/ui/Button.vue'
	import DeleteModal from '@/shared/ui/DeleteModal.vue'
	import Pagination from '@/shared/ui/Pagination.vue'

	import { canvasSizesApi } from '../api/canvas-sizes'
	import CanvasSizeCreateModal from '../components/CanvasSizeCreateModal.vue'
	import CanvasSizesTable from '../components/CanvasSizesTable.vue'
	import type { CanvasSize } from '../types/canvas-size'

	const loading = ref(false)
	const canvasSizes = ref<CanvasSize[]>([])
	const showCanvasSizeModal = ref(false)
	const selectedCanvasSize = ref<CanvasSize | null>(null)
	const showDeleteModal = ref(false)
	const loadingDeleteModal = ref(false)
	const total = ref(0)
	const limit = ref(10)
	const offset = ref(0)

	const load = async () => {
		loading.value = true
		try {
			const result = await canvasSizesApi.listCanvasSizes({
				limit: limit.value,
				offset: offset.value
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
			await canvasSizesApi.deleteCanvasSize(selectedCanvasSize.value.id)
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
			await canvasSizesApi.reorderCanvasSizes({
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

		<CanvasSizesTable
			:canvas-sizes="canvasSizes"
			:loading="loading"
			@edit="editCanvasSize"
			@delete="deleteCanvasSize"
			@reorder="reorderCanvasSizes"
		/>

		<Pagination :total="total" :limit="limit" :offset="offset" @update:offset="changeOffset" />

		<CanvasSizeCreateModal
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
