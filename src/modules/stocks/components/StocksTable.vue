<script setup lang="ts">
	import DataTable from '@/shared/ui/DataTable.vue'
	import TableRowActions from '@/shared/ui/TableRowActions.vue'
	import StatusBadge from '@/shared/ui/StatusBadge.vue'

	import { STOCKS_TABLE_COLUMNS } from '../helpers'
	import type { Stock } from '../types'

	defineProps<{
		stocks: Stock[]
		loading: boolean
		pagination: { limit: number; offset: number }
	}>()

	const emit = defineEmits<{
		(e: 'edit', stock: Stock): void
		(e: 'delete', stock: Stock): void
		(e: 'reorder', stocks: Stock[]): void
	}>()

	const toStock = (row: unknown) => row as Stock

	const onReorder = (rows: unknown[]) => {
		emit('reorder', rows as Stock[])
	}
</script>

<template>
	<DataTable
		:columns="STOCKS_TABLE_COLUMNS"
		:rows="stocks"
		:loading="loading"
		empty-text="Пока нет акций."
		draggable
		order-key="order"
		:pagination="pagination"
		@reorder="onReorder"
	>
		<template #cell-title="{ row }">
			<span class="text-gray-800">{{ toStock(row).title }}</span>
		</template>

		<template #cell-description="{ row }">
			<span class="text-gray-700">{{ toStock(row).description }}</span>
		</template>

		<template #cell-image_url="{ row }">
			<img :src="toStock(row).image_url" alt="Stock Image" class="h-40 w-40 object-contain" />
		</template>

		<template #cell-order="{ row }">
			<span class="text-gray-700">{{ toStock(row).order }}</span>
		</template>

		<template #cell-is_active="{ row }">
			<StatusBadge :tone-class="toStock(row).is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'">
				{{ toStock(row).is_active ? 'Опубликован' : 'Не опубликован' }}
			</StatusBadge>
		</template>

		<template #cell-actions="{ row }">
			<TableRowActions show-edit @edit="emit('edit', toStock(row))" @delete="emit('delete', toStock(row))" />
		</template>
	</DataTable>
</template>
