<script setup lang="ts">
	import DataTable from '@/shared/ui/DataTable.vue'
	import TableRowActions from '@/shared/ui/TableRowActions.vue'
	import StatusBadge from '@/shared/ui/StatusBadge.vue'

	import { CANVAS_SIZES_TABLE_COLUMNS } from '../helpers'
	import type { CanvasSize } from '../types'

	defineProps<{
		canvasSizes: CanvasSize[]
		loading: boolean
		pagination: { limit: number; offset: number }
	}>()

	const emit = defineEmits<{
		(e: 'edit', canvasSize: CanvasSize): void
		(e: 'delete', canvasSize: CanvasSize): void
		(e: 'reorder', canvasSizes: CanvasSize[]): void
	}>()

	const toCanvasSize = (row: unknown) => row as CanvasSize

	const onReorder = (rows: unknown[]) => {
		emit('reorder', rows as CanvasSize[])
	}
</script>

<template>
	<DataTable
		:columns="CANVAS_SIZES_TABLE_COLUMNS"
		:rows="canvasSizes"
		:loading="loading"
		empty-text="Пока нет размеров холста."
		draggable
		order-key="sort_order"
		:pagination="pagination"
		@reorder="onReorder"
	>
		<template #cell-size="{ row }">
			<span class="text-gray-700">
				{{ toCanvasSize(row).width }} x {{ toCanvasSize(row).height }} {{ toCanvasSize(row).unit }}
			</span>
		</template>

		<template #cell-price="{ row }">
			<span class="font-medium text-gray-700">{{ toCanvasSize(row).price }}</span>
		</template>

		<template #cell-is_active="{ row }">
			<StatusBadge
				:tone-class="toCanvasSize(row).is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'"
			>
				{{ toCanvasSize(row).is_active ? 'Опубликован' : 'Не опубликован' }}
			</StatusBadge>
		</template>

		<template #cell-sort_order="{ row }">
			<span class="text-gray-700">{{ toCanvasSize(row).sort_order }}</span>
		</template>

		<template #cell-actions="{ row }">
			<TableRowActions show-edit @edit="emit('edit', toCanvasSize(row))" @delete="emit('delete', toCanvasSize(row))" />
		</template>
	</DataTable>
</template>
