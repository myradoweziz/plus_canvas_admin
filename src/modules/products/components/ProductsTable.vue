<script setup lang="ts">
	import DataTable from '@/shared/ui/DataTable.vue'
	import TableRowActions from '@/shared/ui/TableRowActions.vue'
	import StatusBadge from '@/shared/ui/StatusBadge.vue'

	import { getProductListImageUrl, PRODUCTS_TABLE_COLUMNS } from '../helpers'
	import type { CanvasProduct } from '../types'

	const props = defineProps<{
		products: CanvasProduct[]
		loading: boolean
		pagination: { limit: number; offset: number }
		selectedProducts?: CanvasProduct[]
	}>()

	const emit = defineEmits<{
		(e: 'edit', product: CanvasProduct): void
		(e: 'delete', product: CanvasProduct): void
		(e: 'update:selectedProducts', products: CanvasProduct[]): void
	}>()

	const onUpdateSelected = (rows: unknown[]) => {
		emit('update:selectedProducts', rows as CanvasProduct[])
	}

	const toProduct = (row: unknown) => row as CanvasProduct
	const productImageUrl = (row: unknown) => getProductListImageUrl(toProduct(row))
</script>

<template>
	<DataTable
		:columns="PRODUCTS_TABLE_COLUMNS"
		:rows="products"
		:loading="loading"
		empty-text="Пока нет продуктов."
		selectable
		:selected-rows="selectedProducts"
		:pagination="pagination"
		@update:selected-rows="onUpdateSelected"
		clickable
		@row-click="(row) => emit('edit', toProduct(row))"
	>
		<template #cell-image="{ row }">
			<img
				v-if="productImageUrl(row)"
				:src="productImageUrl(row)!"
				:alt="toProduct(row).name"
				class="h-10 w-10 rounded object-cover ring-1 ring-gray-200"
			/>
			<span v-else class="text-sm text-gray-400">—</span>
		</template>
		<template #cell-name="{ row }">
			<span class="font-medium text-gray-800">{{ toProduct(row).name }}</span>
		</template>
		<template #cell-sku="{ row }">
			<span class="text-gray-700">{{ toProduct(row).sku }}</span>
		</template>

		<template #cell-price="{ row }">
			<span class="text-gray-700">{{ toProduct(row).price }}</span>
		</template>

		<template #cell-is_published="{ row }">
			<StatusBadge
				:tone-class="toProduct(row).is_published ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'"
			>
				{{ toProduct(row).is_published ? 'Опубликован' : 'Не опубликован' }}
			</StatusBadge>
		</template>

		<template #cell-actions="{ row }">
			<TableRowActions @delete="emit('delete', toProduct(row))" />
		</template>
	</DataTable>
</template>
