<script setup lang="ts">
	import Button from '@/shared/ui/Button.vue'
	import DataTable from '@/shared/ui/DataTable.vue'

	import { EditIcon, TrashIcon } from '@/shared/icons'
	import { PRODUCTS_TABLE_COLUMNS } from '../helpers'
	import type { CanvasProduct } from '../types/product'

	defineProps<{
		products: CanvasProduct[]
		loading: boolean
	}>()

	defineEmits<{
		(e: 'edit', product: CanvasProduct): void
		(e: 'delete', product: CanvasProduct): void
	}>()

	const toProduct = (row: unknown) => row as CanvasProduct
</script>

<template>
	<DataTable :columns="PRODUCTS_TABLE_COLUMNS" :rows="products" :loading="loading" empty-text="Пока нет продуктов.">
		<template #cell-name="{ row }">
			<span class="font-medium text-gray-800">{{ toProduct(row).name }}</span>
		</template>

		<template #cell-slug="{ row }">
			<span class="text-gray-700">{{ toProduct(row).slug }}</span>
		</template>

		<template #cell-price="{ row }">
			<span class="text-gray-700">{{ toProduct(row).price }}</span>
		</template>

		<template #cell-product_qode="{ row }">
			<span class="text-gray-700">{{ toProduct(row).product_qode }}</span>
		</template>

		<template #cell-flag="{ row }">
			<span class="text-gray-700">{{ toProduct(row).flag }}</span>
		</template>

		<template #cell-actions="{ row }">
			<div class="flex items-center justify-end gap-2">
				<Button
					type="button"
					variant="ghost"
					size="icon"
					class-name="hover:bg-green-100"
					aria-label="Edit"
					:on-click="() => $emit('edit', toProduct(row))"
				>
					<EditIcon />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					class-name="hover:text-red-700"
					aria-label="Delete"
					:on-click="() => $emit('delete', toProduct(row))"
				>
					<TrashIcon />
				</Button>
			</div>
		</template>
	</DataTable>
</template>
