<script setup lang="ts">
	import Button from '@/shared/ui/Button.vue'
	import DataTable from '@/shared/ui/DataTable.vue'

	import { EditIcon, TrashIcon } from '@/shared/icons'
	import { STOCKS_TABLE_COLUMNS } from '../helpers'
	import type { Stock } from '../types'

	defineProps<{
		stocks: Stock[]
		loading: boolean
	}>()

	const emit = defineEmits<{
		(e: 'edit', stock: Stock): void
		(e: 'delete', stock: Stock): void
		(e: 'reorder', stocks: Stock[]): void
	}>()

	const toStock = (row: unknown) => row as Stock

	const onReorder = (rows: unknown[]) => {
		emit('reorder', rows as Stock[])
	}
</script>

<template>
	<DataTable
		:columns="STOCKS_TABLE_COLUMNS"
		:rows="stocks"
		:loading="loading"
		empty-text="Пока нет акций."
		draggable
		order-key="order"
		@reorder="onReorder"
	>
		<template #cell-title="{ row }">
			<span class="text-gray-800">{{ toStock(row).title }}</span>
		</template>

		<template #cell-description="{ row }">
			<span class="text-gray-700">{{ toStock(row).description }}</span>
		</template>

		<template #cell-image_url="{ row }">
			<img :src="toStock(row).image_url" alt="Stock Image" class="h-40 w-40 object-contain" />
		</template>

		<template #cell-order="{ row }">
			<span class="text-gray-700">{{ toStock(row).order }}</span>
		</template>

		<template #cell-is_active="{ row }">
			<span
				class="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold"
				:class="toStock(row).is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'"
			>
				{{ toStock(row).is_active ? 'Активно' : 'Не активно' }}
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
					:on-click="() => $emit('edit', toStock(row))"
				>
					<EditIcon />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					class-name="hover:text-red-700"
					aria-label="Delete"
					:on-click="() => $emit('delete', toStock(row))"
				>
					<TrashIcon />
				</Button>
			</div>
		</template>
	</DataTable>
</template>
