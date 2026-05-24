<script setup lang="ts">
	import DataTable from '@/shared/ui/DataTable.vue'
	import ProductRequiresSaveNotice from './ProductRequiresSaveNotice.vue'

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

	const formatStatusLabel = (value: string) => {
		if (!value) return '—'
		return value.replace(/_/g, ' ')
	}

	const statusBadgeClass = (value: string) => {
		const normalized = value.toLowerCase()

		if (['completed', 'paid', 'delivered', 'success', 'active'].includes(normalized)) {
			return 'bg-green-100 text-green-700'
		}

		if (['pending', 'processing', 'in_progress', 'awaiting'].some((item) => normalized.includes(item))) {
			return 'bg-amber-100 text-amber-800'
		}

		if (['cancelled', 'canceled', 'failed', 'refunded', 'rejected'].some((item) => normalized.includes(item))) {
			return 'bg-red-100 text-red-700'
		}

		return 'bg-gray-100 text-gray-700'
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
					<span
						class="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold capitalize"
						:class="statusBadgeClass(toOrder(row).order_status)"
					>
						{{ formatStatusLabel(toOrder(row).order_status) }}
					</span>
				</template>

				<template #cell-payment_status="{ row }">
					<span
						class="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold capitalize"
						:class="statusBadgeClass(toOrder(row).payment_status)"
					>
						{{ formatStatusLabel(toOrder(row).payment_status) }}
					</span>
				</template>

				<template #cell-delivery_status="{ row }">
					<span
						class="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold capitalize"
						:class="statusBadgeClass(toOrder(row).delivery_status)"
					>
						{{ formatStatusLabel(toOrder(row).delivery_status) }}
					</span>
				</template>

				<template #cell-created_at="{ row }">
					<span class="text-gray-700">{{ formatDate(toOrder(row).created_at) }}</span>
				</template>
			</DataTable>
		</div>
	</div>
</template>
