<script setup lang="ts">
	import DataTable from '@/shared/ui/DataTable.vue'
	import StatusBadge from '@/shared/ui/StatusBadge.vue'

	import { formatMoney, formatOrderDate, statusBadgeClass } from '@/modules/orders/helpers'
	import type { Order } from '@/modules/orders/types'
	import { USER_ORDERS_TABLE_COLUMNS } from '../../helpers/user-orders'

	defineProps<{
		orders: Order[]
		loading: boolean
	}>()

	const emit = defineEmits<{
		(e: 'open', order: Order): void
	}>()

	const toOrder = (row: unknown) => row as Order
</script>

<template>
	<DataTable
		:columns="USER_ORDERS_TABLE_COLUMNS"
		:rows="orders"
		:loading="loading"
		empty-text="Заказов не найдено."
		:pagination="{ limit: orders.length || 1, offset: 0 }"
		clickable
		@row-click="(row) => emit('open', toOrder(row))"
	>
		<template #cell-order_number="{ row }">
			<span class="font-medium text-gray-800">{{ toOrder(row).order_number }}</span>
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

		<template #cell-created_at="{ row }">
			<span class="text-gray-700">{{ formatOrderDate(toOrder(row).created_at) }}</span>
		</template>

		<template #cell-total="{ row }">
			<span class="font-medium text-gray-800">{{ formatMoney(toOrder(row).total) }}</span>
		</template>

	</DataTable>
</template>
