<script setup lang="ts">
	import DataTable from '@/shared/ui/DataTable.vue'
	import StatusBadge from '@/shared/ui/StatusBadge.vue'
	import TableRowActions from '@/shared/ui/TableRowActions.vue'
	import { DISCOUNTS_TABLE_COLUMNS, formatDiscountAmount, formatDiscountPeriod } from '../helpers'
	import type { Discount } from '../types'

	defineProps<{
		discounts: Discount[]
		loading: boolean
	}>()

	const emit = defineEmits<{
		(e: 'edit', discount: Discount): void
		(e: 'delete', discount: Discount): void
	}>()

	const toDiscount = (row: unknown) => row as Discount
</script>

<template>
	<DataTable
		:columns="DISCOUNTS_TABLE_COLUMNS"
		:rows="discounts"
		:loading="loading"
		empty-text="Пока нет скидок."
		clickable
		@row-click="(row) => emit('edit', toDiscount(row))"
	>
		<template #cell-name="{ row }">
			<span class="font-medium text-gray-800">{{ toDiscount(row).name }}</span>
		</template>

		<template #cell-discount_type="{ row }">
			<span class="text-gray-700">
				{{
					toDiscount(row).discount_type?.name ??
					(toDiscount(row).discount_type_id ? `#${toDiscount(row).discount_type_id}` : '—')
				}}
			</span>
		</template>

		<template #cell-slug="{ row }">
			<span class="text-gray-700">{{ toDiscount(row).slug || '—' }}</span>
		</template>

		<template #cell-amount="{ row }">
			<span class="text-gray-700">{{ formatDiscountAmount(toDiscount(row)) }}</span>
		</template>

		<template #cell-period="{ row }">
			<span class="text-gray-700">
				{{ formatDiscountPeriod(toDiscount(row).start_date, toDiscount(row).end_date) }}
			</span>
		</template>

		<template #cell-is_active="{ row }">
			<StatusBadge
				:tone-class="toDiscount(row).is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'"
			>
				{{ toDiscount(row).is_active ? 'Активна' : 'Не активна' }}
			</StatusBadge>
		</template>

		<template #cell-actions="{ row }">
			<TableRowActions @delete="emit('delete', toDiscount(row))" />
		</template>
	</DataTable>
</template>
