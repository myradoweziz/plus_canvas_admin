<script setup lang="ts">
	import DataTable from '@/shared/ui/DataTable.vue'
	import StatusBadge from '@/shared/ui/StatusBadge.vue'

	import { formatMoney, formatOrderDate, ORDERS_TABLE_COLUMNS, statusBadgeClass } from '../helpers'
	import type { Order } from '../types'

	defineProps<{
		orders: Order[]
		loading: boolean
	}>()

	const emit = defineEmits<{
		(e: 'open', order: Order): void
	}>()

	const toOrder = (row: unknown) => row as Order

	const customerName = (order: Order) => {
		const name = [order.first_name, order.last_name].filter(Boolean).join(' ').trim()
		return name || order.user?.name || '—'
	}
</script>

<template>
	<DataTable
		:columns="ORDERS_TABLE_COLUMNS"
		:rows="orders"
		:loading="loading"
		empty-text="Заказов не найдено."
		clickable
		@row-click="(row) => emit('open', toOrder(row))"
	>
		<template #cell-order_number="{ row }">
			<span class="font-medium text-gray-800">{{ toOrder(row).order_number || '—' }}</span>
		</template>

		<template #cell-customer="{ row }">
			<span class="text-gray-700">{{ customerName(toOrder(row)) }}</span>
		</template>

		<template #cell-email="{ row }">
			<span class="text-gray-700">{{ toOrder(row).email || '—' }}</span>
		</template>

		<template #cell-phone="{ row }">
			<span class="text-gray-700">{{ toOrder(row).phone || '—' }}</span>
		</template>

		<template #cell-total="{ row }">
			<span class="font-medium text-gray-800">{{ formatMoney(toOrder(row).total) }}</span>
		</template>

		<template #cell-order_status="{ row }">
			<StatusBadge :tone-class="statusBadgeClass(toOrder(row).order_status)" class="capitalize">
				{{ toOrder(row).order_status }}
			</StatusBadge>
		</template>

		<template #cell-payment_status="{ row }">
			<StatusBadge :tone-class="statusBadgeClass(toOrder(row).payment_status)" class="capitalize">
				{{ toOrder(row).payment_status }}
			</StatusBadge>
		</template>

		<template #cell-delivery_status="{ row }">
			<StatusBadge :tone-class="statusBadgeClass(toOrder(row).delivery_status)" class="capitalize">
				{{ toOrder(row).delivery_status }}
			</StatusBadge>
		</template>

		<template #cell-items_count="{ row }">
			<span class="text-gray-700">{{ toOrder(row).items?.length ?? 0 }}</span>
		</template>

		<template #cell-created_at="{ row }">
			<span class="text-gray-700">{{ formatOrderDate(toOrder(row).created_at) }}</span>
		</template>
	</DataTable>
</template>
