<script setup lang="ts">
	import Button from '@/shared/ui/Button.vue'
	import DataTable from '@/shared/ui/DataTable.vue'

	import { EditIcon, TrashIcon } from '@/shared/icons'
	import { DISCOUNTS_TABLE_COLUMNS } from '../helpers'
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

	const toDiscount = (row: unknown) => row as Discount

	const onReorder = (rows: unknown[]) => {
		emit('reorder', rows as Discount[])
	}
</script>

<template>
	<DataTable
		:columns="DISCOUNTS_TABLE_COLUMNS"
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
				{{ toDiscount(row).is_active ? 'Активно' : 'Не активно' }}
			</span>
		</template>

		<template #cell-actions="{ row }">
			<div class="flex items-center justify-end gap-2">
				<Button
					type="button"
					variant="ghost"
					size="icon"
					class-name="hover:bg-green-100"
					aria-label="Edit"
					:on-click="() => $emit('edit', toDiscount(row))"
				>
					<EditIcon />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					class-name="hover:text-red-700"
					aria-label="Delete"
					:on-click="() => $emit('delete', toDiscount(row))"
				>
					<TrashIcon />
				</Button>
			</div>
		</template>
	</DataTable>
</template>
