<script setup lang="ts">
	import DataTable from '@/shared/ui/DataTable.vue'
	import TableRowActions from '@/shared/ui/TableRowActions.vue'
	import StatusBadge from '@/shared/ui/StatusBadge.vue'

	import { PAYMENT_METHODS_TABLE_COLUMNS } from '../../helpers'
	import type { PaymentMethod } from '../../types'

	defineProps<{
		items: PaymentMethod[]
		loading: boolean
	}>()

	defineEmits<{
		(e: 'edit', item: PaymentMethod): void
		(e: 'delete', item: PaymentMethod): void
	}>()

	const toItem = (row: unknown) => row as PaymentMethod
	const badgeClass = (value: boolean) => (value ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700')
</script>

<template>
	<DataTable
		:columns="PAYMENT_METHODS_TABLE_COLUMNS"
		:rows="items"
		:loading="loading"
		empty-text="Пока нет способов оплаты."
		clickable
		@row-click="(row) => $emit('edit', toItem(row))"
	>
		<template #cell-logo_path="{ row }">
			<img
				v-if="toItem(row).logo_path"
				:src="toItem(row).logo_path"
				:alt="toItem(row).friendly_name"
				class="h-10 w-16 rounded object-contain ring-1 ring-gray-200"
			/>
			<span v-else class="text-sm text-gray-400">—</span>
		</template>

		<template #cell-friendly_name="{ row }">
			<span class="font-medium text-gray-800">{{ toItem(row).friendly_name }}</span>
		</template>

		<template #cell-system_name="{ row }">
			<span class="text-gray-700">{{ toItem(row).system_name }}</span>
		</template>

		<template #cell-display_order="{ row }">
			<span class="text-gray-700">{{ toItem(row).display_order }}</span>
		</template>

		<template #cell-is_active="{ row }">
			<StatusBadge :tone-class="badgeClass(toItem(row).is_active)">
				{{ toItem(row).is_active ? 'Опубликован' : 'Не опубликован' }}
			</StatusBadge>
		</template>

		<template #cell-actions="{ row }">
			<TableRowActions @delete="$emit('delete', toItem(row))" />
		</template>
	</DataTable>
</template>
