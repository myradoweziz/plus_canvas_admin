<template>
	<DataTable
		:columns="columns"
		:rows="discounts"
		:loading="loading"
		empty-text="Пока нет скидок."
		draggable
		order-key="order"
		@reorder="onReorder"
	>
		<template #cell-title="{ row }">
			<span class="text-gray-800">{{ toDiscount(row).title }}</span>
		</template>

		<template #cell-description="{ row }">
			<span class="text-gray-700">{{ toDiscount(row).description }}</span>
		</template>

		<template #cell-image_url="{ row }">
			<img :src="toDiscount(row).image_url" alt="Discount Image" class="h-40 w-40 object-contain" />
		</template>

		<template #cell-order="{ row }">
			<span class="text-gray-700">{{ toDiscount(row).order }}</span>
		</template>

		<template #cell-is_active="{ row }">
			<span
				class="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold"
				:class="toDiscount(row).is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'"
			>
				{{ toDiscount(row).is_active ? 'true' : 'false' }}
			</span>
		</template>

		<template #cell-actions="{ row }">
			<div class="flex items-center justify-end gap-2">
				<button
					type="button"
					class="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-green-100 hover:text-gray-900"
					aria-label="Edit"
					@click="$emit('edit', toDiscount(row))"
				>
					<EditIcon />
				</button>
				<button
					type="button"
					class="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 hover:text-red-700"
					aria-label="Delete"
					@click="$emit('delete', toDiscount(row))"
				>
					<TrashIcon />
				</button>
			</div>
		</template>
	</DataTable>
</template>

<script setup lang="ts">
	import { EditIcon, TrashIcon } from '@/shared/icons'
	import DataTable from '@/shared/ui/DataTable.vue'
	import type { Discount } from '../types/discount'

	defineProps<{
		discounts: Discount[]
		loading: boolean
	}>()

	const emit = defineEmits<{
		(e: 'edit', discount: Discount): void
		(e: 'delete', discount: Discount): void
		(e: 'reorder', discounts: Discount[]): void
	}>()

	const columns = [
		{ key: 'title', label: 'Title' },
		{ key: 'description', label: 'Description' },
		{ key: 'image_url', label: 'Image' },
		{ key: 'order', label: 'Order' },
		{ key: 'is_active', label: 'Active' },
		{ key: 'actions', label: 'Actions', headerClass: 'text-right' }
	]

	const toDiscount = (row: unknown) => row as Discount

	const onReorder = (rows: unknown[]) => {
		emit('reorder', rows as Discount[])
	}
</script>

