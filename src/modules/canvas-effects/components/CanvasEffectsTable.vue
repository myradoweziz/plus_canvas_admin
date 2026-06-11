<script setup lang="ts">
	import DataTable from '@/shared/ui/DataTable.vue'
	import TableRowActions from '@/shared/ui/TableRowActions.vue'
	import StatusBadge from '@/shared/ui/StatusBadge.vue'

	import { CANVAS_EFFECTS_TABLE_COLUMNS } from '../helpers'
	import type { CanvasEffect } from '../types'

	defineProps<{
		effects: CanvasEffect[]
		loading: boolean
		pagination: { limit: number; offset: number }
	}>()

	const emit = defineEmits<{
		(e: 'edit', effect: CanvasEffect): void
		(e: 'delete', effect: CanvasEffect): void
	}>()

	const toEffect = (row: unknown) => row as CanvasEffect

	const imageSrc = (effect: CanvasEffect) => effect.image_url || effect.image || ''
</script>

<template>
	<DataTable
		:columns="CANVAS_EFFECTS_TABLE_COLUMNS"
		:rows="effects"
		:loading="loading"
		empty-text="Пока нет эффектов."
		:pagination="pagination"
		clickable
		@row-click="(row) => emit('edit', toEffect(row))"
	>
		<template #cell-name="{ row }">
			<span class="font-medium text-gray-800">{{ toEffect(row).name }}</span>
		</template>

		<template #cell-image_url="{ row }">
			<img
				v-if="imageSrc(toEffect(row))"
				:src="imageSrc(toEffect(row))"
				:alt="toEffect(row).name"
				class="h-16 w-24 rounded-lg object-cover ring-1 ring-gray-200"
			/>
			<span v-else class="text-sm text-gray-400">—</span>
		</template>

		<template #cell-sort_order="{ row }">
			<span class="text-gray-700">{{ toEffect(row).sort_order }}</span>
		</template>

		<template #cell-is_active="{ row }">
			<StatusBadge :tone-class="toEffect(row).is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'">
				{{ toEffect(row).is_active ? 'Опубликован' : 'Не опубликован' }}
			</StatusBadge>
		</template>

		<template #cell-actions="{ row }">
			<TableRowActions @delete="emit('delete', toEffect(row))" />
		</template>
	</DataTable>
</template>
