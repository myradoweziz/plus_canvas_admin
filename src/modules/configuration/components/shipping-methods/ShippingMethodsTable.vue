<script setup lang="ts">
	import DataTable from '@/shared/ui/DataTable.vue'
	import TableRowActions from '@/shared/ui/TableRowActions.vue'

	import { SHIPPING_METHODS_TABLE_COLUMNS } from '../../helpers'
	import type { ShippingMethod } from '../../types'

	defineProps<{
		items: ShippingMethod[]
		loading: boolean
	}>()

	defineEmits<{
		(e: 'edit', item: ShippingMethod): void
		(e: 'delete', item: ShippingMethod): void
	}>()

	const toItem = (row: unknown) => row as ShippingMethod
</script>

<template>
	<DataTable :columns="SHIPPING_METHODS_TABLE_COLUMNS" :rows="items" :loading="loading" empty-text="Пока нет способов доставки."
		clickable
		@row-click="(row) => $emit('edit', toItem(row))">
		<template #cell-name="{ row }">
			<span class="font-medium text-gray-800">{{ toItem(row).name }}</span>
		</template>

		<template #cell-description="{ row }">
			<span class="text-gray-700">{{ toItem(row).description }}</span>
		</template>

		<template #cell-display_order="{ row }">
			<span class="text-gray-700">{{ toItem(row).display_order }}</span>
		</template>

		<template #cell-actions="{ row }">
			<TableRowActions @delete="$emit('delete', toItem(row))" />
		</template>
	</DataTable>
</template>

