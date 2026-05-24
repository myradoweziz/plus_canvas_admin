<script setup lang="ts">
	import DataTable from '@/shared/ui/DataTable.vue'
	import StatusBadge from '@/shared/ui/StatusBadge.vue'
	import ProductRequiresSaveNotice from './ProductRequiresSaveNotice.vue'

	import {
		formatDeliveryStatusLabel,
		formatOrderStatusLabel,
		formatPaymentStatusLabel,
		statusBadgeClass
	} from '@/modules/orders/helpers'
	import { api } from '../../api'
	import { useProductTabResource } from '../../composables'
	import { PRODUCT_ORDERS_TABLE_COLUMNS } from '../../helpers'
	import type { CanvasProductOrder } from '../../types'

	const props = defineProps<{
		productId: number | null
	}>()

	const { items: orders, loading } = useProductTabResource(
		() => props.productId,
		(id) => api.listCanvasProductOrders(id),
		'Не удалось загрузить заказы'
	)

	const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	})

	const formatDate = (value: string) => {
		if (!value) return '—'
		const date = new Date(value)
		return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date)
	}

	const toOrder = (row: unknown) => row as CanvasProductOrder
</script>

<template>
	<div class="contents">
		<ProductRequiresSaveNotice v-if="!productId" suffix=", затем откройте список заказов" />

		<div v-else class="md:col-span-3">
			<p class="mb-3 text-sm text-gray-600">Заказы, связанные с этим продуктом (только просмотр).</p>

			<DataTable
				:columns="PRODUCT_ORDERS_TABLE_COLUMNS"
				:rows="orders"
				:loading="loading"
				empty-text="Заказов по этому продукту пока нет."
			>
				<template #cell-id="{ row }">
					<span class="font-medium text-gray-800">#{{ toOrder(row).id }}</span>
				</template>

				<template #cell-email="{ row }">
					<span class="text-gray-700">{{ toOrder(row).email || '—' }}</span>
				</template>

				<template #cell-order_status="{ row }">
					<StatusBadge :tone-class="statusBadgeClass(toOrder(row).order_status)">
						{{ formatOrderStatusLabel(toOrder(row).order_status) }}
					</StatusBadge>
				</template>

				<template #cell-payment_status="{ row }">
					<StatusBadge :tone-class="statusBadgeClass(toOrder(row).payment_status)">
						{{ formatPaymentStatusLabel(toOrder(row).payment_status) }}
					</StatusBadge>
				</template>

				<template #cell-delivery_status="{ row }">
					<StatusBadge :tone-class="statusBadgeClass(toOrder(row).delivery_status)">
						{{ formatDeliveryStatusLabel(toOrder(row).delivery_status) }}
					</StatusBadge>
				</template>

				<template #cell-created_at="{ row }">
					<span class="text-gray-700">{{ formatDate(toOrder(row).created_at) }}</span>
				</template>
			</DataTable>
		</div>
	</div>
</template>
