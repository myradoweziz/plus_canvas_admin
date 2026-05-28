<script setup lang="ts">
	import Button from '@/shared/ui/Button.vue'
	import DataTable from '@/shared/ui/DataTable.vue'
	import StatusBadge from '@/shared/ui/StatusBadge.vue'

	import { EditIcon, TrashIcon } from '@/shared/icons'
	import { PRODUCTS_TABLE_COLUMNS } from '../helpers'
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
	>
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
				{{ toProduct(row).is_published ? 'Активно' : 'Не активно' }}
			</StatusBadge>
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
