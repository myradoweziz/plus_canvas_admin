<script setup lang="ts">
	import DataTable from '@/shared/ui/DataTable.vue'
	import StatusBadge from '@/shared/ui/StatusBadge.vue'
	import TableRowActions from '@/shared/ui/TableRowActions.vue'
	import { COLORS_TABLE_COLUMNS } from '../helpers'
	import type { Color } from '../types'

	defineProps<{
		colors: Color[]
		loading: boolean
		pagination: { limit: number; offset: number }
	}>()

	const emit = defineEmits<{
		(e: 'edit', color: Color): void
		(e: 'delete', color: Color): void
	}>()

	const toColor = (row: unknown) => row as Color
</script>

<template>
	<DataTable
		:columns="COLORS_TABLE_COLUMNS"
		:rows="colors"
		:loading="loading"
		empty-text="Пока нет цветов."
		:pagination="pagination"
		clickable
		@row-click="(row) => emit('edit', toColor(row))"
	>
		<template #cell-name="{ row }">
			<span class="font-medium text-gray-800">{{ toColor(row).name }}</span>
		</template>

		<template #cell-hex_code="{ row }">
			<div class="flex items-center gap-2">
				<span
					class="h-6 w-6 rounded-full border border-gray-200"
					:style="{ backgroundColor: toColor(row).hex_code }"
				></span>
				<span class="font-medium text-gray-700">{{ toColor(row).hex_code }}</span>
			</div>
		</template>

		<template #cell-is_active="{ row }">
			<StatusBadge :tone-class="toColor(row).is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'">
				{{ toColor(row).is_active ? 'Опубликован' : 'Не опубликован' }}
			</StatusBadge>
		</template>

		<template #cell-actions="{ row }">
			<TableRowActions @delete="emit('delete', toColor(row))" />
		</template>
	</DataTable>
</template>
