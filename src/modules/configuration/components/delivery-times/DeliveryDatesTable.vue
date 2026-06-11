<script setup lang="ts">
	import DataTable from '@/shared/ui/DataTable.vue'
	import TableRowActions from '@/shared/ui/TableRowActions.vue'

	import { DELIVERY_DATES_TABLE_COLUMNS } from '../../helpers'
	import type { DeliveryDate } from '../../types'

	defineProps<{
		items: DeliveryDate[]
		loading: boolean
	}>()

	defineEmits<{
		(e: 'edit', item: DeliveryDate): void
		(e: 'delete', item: DeliveryDate): void
	}>()

	const toItem = (row: unknown) => row as DeliveryDate
</script>

<template>
	<DataTable
		:columns="DELIVERY_DATES_TABLE_COLUMNS"
		:rows="items"
		:loading="loading"
		empty-text="Пока нет сроков доставки."
		clickable
		@row-click="(row) => $emit('edit', toItem(row))"
	>
		<template #cell-name="{ row }">
			<span class="font-medium text-gray-800">{{ toItem(row).name }}</span>
		</template>

		<template #cell-display_order="{ row }">
			<span class="text-gray-700">{{ toItem(row).display_order }}</span>
		</template>

		<template #cell-actions="{ row }">
			<TableRowActions @delete="$emit('delete', toItem(row))" />
		</template>
	</DataTable>
</template>
