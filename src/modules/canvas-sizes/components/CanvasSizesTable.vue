<script setup lang="ts">
	import Button from '@/shared/ui/Button.vue'
	import DataTable from '@/shared/ui/DataTable.vue'

	import { EditIcon, TrashIcon } from '@/shared/icons'
	import { CANVAS_SIZES_TABLE_COLUMNS } from '../helpers'
	import type { CanvasSize } from '../types'

	defineProps<{
		canvasSizes: CanvasSize[]
		loading: boolean
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
			<span
				class="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold"
				:class="toCanvasSize(row).is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'"
			>
				{{ toCanvasSize(row).is_active ? 'Активно' : 'Не активно' }}
			</span>
		</template>

		<template #cell-sort_order="{ row }">
			<span class="text-gray-700">{{ toCanvasSize(row).sort_order }}</span>
		</template>

		<template #cell-actions="{ row }">
			<div class="flex items-center justify-end gap-2">
				<Button
					type="button"
					variant="ghost"
					size="icon"
					class-name="hover:bg-green-100"
					aria-label="Edit"
					:on-click="() => $emit('edit', toCanvasSize(row))"
				>
					<EditIcon />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					class-name="hover:text-red-700"
					aria-label="Delete"
					:on-click="() => $emit('delete', toCanvasSize(row))"
				>
					<TrashIcon />
				</Button>
			</div>
		</template>
	</DataTable>
</template>
