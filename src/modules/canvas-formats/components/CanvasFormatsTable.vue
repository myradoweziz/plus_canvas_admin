<script setup lang="ts">
	import Button from '@/shared/ui/Button.vue'
	import DataTable from '@/shared/ui/DataTable.vue'
	import StatusBadge from '@/shared/ui/StatusBadge.vue'

	import { EditIcon, TrashIcon } from '@/shared/icons'
	import { CANVAS_FORMATS_TABLE_COLUMNS } from '../helpers'
	import { type CanvasFormat, getCanvasFormatSizeLabel } from '../types'

	defineProps<{
		canvasFormats: CanvasFormat[]
		loading: boolean
		pagination: { limit: number; offset: number }
	}>()

	const emit = defineEmits<{
		(e: 'edit', canvasFormat: CanvasFormat): void
		(e: 'delete', canvasFormat: CanvasFormat): void
		(e: 'reorder', canvasFormats: CanvasFormat[]): void
	}>()

	const toCanvasFormat = (row: unknown) => row as CanvasFormat

	const onReorder = (rows: unknown[]) => {
		emit('reorder', rows as CanvasFormat[])
	}
</script>

<template>
	<DataTable
		:columns="CANVAS_FORMATS_TABLE_COLUMNS"
		:rows="canvasFormats"
		:loading="loading"
		empty-text="Пока нет форматов холста."
		draggable
		order-key="sort_order"
		:pagination="pagination"
		@reorder="onReorder"
	>
		<template #cell-name="{ row }">
			<span class="font-medium text-gray-800">{{ toCanvasFormat(row).name }}</span>
		</template>

		<template #cell-slug="{ row }">
			<span class="text-gray-700">{{ toCanvasFormat(row).slug }}</span>
		</template>

		<template #cell-sizes="{ row }">
			<div class="flex flex-wrap gap-1">
				<span
					v-for="size in toCanvasFormat(row).sizes"
					:key="size.id"
					class="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700"
				>
					{{ getCanvasFormatSizeLabel(size) }}
				</span>
			</div>
		</template>

		<template #cell-is_active="{ row }">
			<StatusBadge
				:tone-class="toCanvasFormat(row).is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'"
			>
				{{ toCanvasFormat(row).is_active ? 'Активно' : 'Не активно' }}
			</StatusBadge>
		</template>

		<template #cell-sort_order="{ row }">
			<span class="text-gray-700">{{ toCanvasFormat(row).sort_order }}</span>
		</template>

		<template #cell-actions="{ row }">
			<div class="flex items-center justify-end gap-2">
				<Button
					type="button"
					variant="ghost"
					size="icon"
					class-name="hover:bg-green-100"
					aria-label="Edit"
					:on-click="() => $emit('edit', toCanvasFormat(row))"
				>
					<EditIcon />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					class-name="hover:text-red-700"
					aria-label="Delete"
					:on-click="() => $emit('delete', toCanvasFormat(row))"
				>
					<TrashIcon />
				</Button>
			</div>
		</template>
	</DataTable>
</template>
