<script setup lang="ts">
	import DataTable from '@/shared/ui/DataTable.vue'

	import { formatMoney } from '@/modules/orders/helpers'
	import { formatUserDate } from '../../helpers/users'
	import { formatCartItemOptions, USER_SHOPPING_CART_TABLE_COLUMNS } from '../../helpers/user-shopping-cart'
	import type { UserShoppingCartItem } from '../../types'

	defineProps<{
		items: UserShoppingCartItem[]
		loading: boolean
	}>()

	const toItem = (row: unknown) => row as UserShoppingCartItem

	const productImage = (item: UserShoppingCartItem) => item.canvas_product?.images?.[0]?.url || ''
</script>

<template>
	<DataTable
		:columns="USER_SHOPPING_CART_TABLE_COLUMNS"
		:rows="items"
		:loading="loading"
		empty-text="Корзина пуста."
		:pagination="{ limit: items.length || 1, offset: 0 }"
	>
		<template #cell-product="{ row }">
			<div class="flex min-w-[180px] items-center gap-3">
				<img
					v-if="productImage(toItem(row))"
					:src="productImage(toItem(row))"
					:alt="toItem(row).canvas_product?.name || 'Товар'"
					class="h-12 w-12 rounded-lg border border-gray-200 object-cover"
				/>
				<div>
					<p class="font-medium text-gray-800">{{ toItem(row).canvas_product?.name || '—' }}</p>
					<p class="text-xs text-gray-500">ID: {{ toItem(row).canvas_product_id }}</p>
				</div>
			</div>
		</template>

		<template #cell-quantity="{ row }">
			<span class="font-medium text-gray-800">{{ toItem(row).quantity }}</span>
		</template>

		<template #cell-options="{ row }">
			<span class="text-gray-700">{{ formatCartItemOptions(toItem(row).options) }}</span>
		</template>

		<template #cell-price="{ row }">
			<span class="font-medium text-gray-800">{{ formatMoney(toItem(row).canvas_product?.price ?? '') }}</span>
		</template>

		<template #cell-updated_at="{ row }">
			<span class="text-gray-700">{{ formatUserDate(toItem(row).updated_at) }}</span>
		</template>
	</DataTable>
</template>
