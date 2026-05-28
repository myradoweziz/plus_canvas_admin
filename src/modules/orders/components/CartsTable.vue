<script setup lang="ts">
	import DataTable from '@/shared/ui/DataTable.vue'

	import { formatDate } from '@/composables'
	import { CARTS_TABLE_COLUMNS } from '../helpers'
	import type { Cart } from '../types'

	defineProps<{
		carts: Cart[]
		loading: boolean
		pagination: { limit: number; offset: number }
	}>()

	const emit = defineEmits<{
		(e: 'open', cart: Cart): void
	}>()

	const toCart = (row: unknown) => row as Cart
</script>

<template>
	<DataTable
		:columns="CARTS_TABLE_COLUMNS"
		:rows="carts"
		:loading="loading"
		empty-text="Заказов не найдено."
		:pagination="pagination"
	>
		<template #cell-id="{ row }">
			<span class="font-medium text-gray-800">#{{ toCart(row).id }}</span>
		</template>
		<template #cell-user="{ row }">
			<p class="font-medium text-gray-800">{{ toCart(row).user?.name }}</p>
			<p class="font-medium text-gray-800">{{ toCart(row).user?.email }}</p>
		</template>
		<template #cell-canvas="{ row }">
			<p class="font-medium text-gray-800">
				{{
					toCart(row)
						.items?.map((item) => item.canvas_product?.name)
						.join(', ')
				}}
			</p>
		</template>
		<template #cell-price="{ row }">
			<span class="font-medium text-gray-800">{{
				toCart(row)
					.items?.map((item) => item.canvas_product?.price)
					.join(', ')
			}}</span>
		</template>
		<template #cell-items_count="{ row }">
			<span class="font-medium text-gray-800">{{ toCart(row).items?.length }}</span>
		</template>
		<template #cell-updated_at="{ row }">
			<span class="font-medium text-gray-800">{{ formatDate(toCart(row).updated_at) }}</span>
		</template>
	</DataTable>
</template>
