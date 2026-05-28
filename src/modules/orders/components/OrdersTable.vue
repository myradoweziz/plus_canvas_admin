<script setup lang="ts">
	import Button from '@/shared/ui/Button.vue'
	import DataTable from '@/shared/ui/DataTable.vue'
	import StatusBadge from '@/shared/ui/StatusBadge.vue'

	import { EditIcon, TrashIcon } from '@/shared/icons'
	import { formatMoney, formatOrderDate, ORDERS_TABLE_COLUMNS, statusBadgeClass } from '../helpers'
	import type { Order } from '../types'

	const props = defineProps<{
		orders: Order[]
		loading: boolean
		pagination: { limit: number; offset: number }
		selectedOrders?: Order[]
	}>()

	const emit = defineEmits<{
		(e: 'open', order: Order): void
		(e: 'delete', order: Order): void
		(e: 'update:selectedOrders', orders: Order[]): void
	}>()

	const onUpdateSelected = (rows: unknown[]) => {
		emit('update:selectedOrders', rows as Order[])
	}

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
		:pagination="pagination"
		selectable
		:selected-rows="selectedOrders"
		@update:selected-rows="onUpdateSelected"
	>
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

		<template #cell-customer="{ row }">
			<div class="min-w-[140px]">
				<p class="font-medium text-gray-800">{{ customerName(toOrder(row)) }}</p>
				<p v-if="toOrder(row).email" class="text-xs text-gray-500">{{ toOrder(row).email }}</p>
			</div>
		</template>

		<template #cell-created_at="{ row }">
			<span class="text-gray-700">{{ formatOrderDate(toOrder(row).created_at) }}</span>
		</template>

		<template #cell-total="{ row }">
			<span class="font-medium text-gray-800">{{ formatMoney(toOrder(row).total) }}</span>
		</template>

		<template #cell-actions="{ row }">
			<div class="flex items-center justify-end gap-2">
				<Button
					type="button"
					variant="ghost"
					size="icon"
					class-name="hover:bg-green-100"
					aria-label="Редактировать"
					:on-click="() => emit('open', toOrder(row))"
				>
					<EditIcon />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					class-name="hover:text-red-700"
					aria-label="Удалить"
					:on-click="() => emit('delete', toOrder(row))"
				>
					<TrashIcon />
				</Button>
			</div>
		</template>
	</DataTable>
</template>
