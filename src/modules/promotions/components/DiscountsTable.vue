<script setup lang="ts">
	import Button from '@/shared/ui/Button.vue'
	import DataTable from '@/shared/ui/DataTable.vue'

	import { EditIcon, TrashIcon } from '@/shared/icons'
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
	>
		<template #cell-name="{ row }">
			<span class="font-medium text-gray-800">{{ toDiscount(row).name }}</span>
		</template>

		<template #cell-discount_type="{ row }">
			<span class="text-gray-700">
				{{ toDiscount(row).discount_type?.name ?? (toDiscount(row).discount_type_id ? `#${toDiscount(row).discount_type_id}` : '—') }}
			</span>
		</template>

		<template #cell-amount="{ row }">
			<span class="text-gray-700">{{ formatDiscountAmount(toDiscount(row)) }}</span>
		</template>

		<template #cell-period="{ row }">
			<span class="text-gray-700">
				{{ formatDiscountPeriod(toDiscount(row).start_date, toDiscount(row).end_date) }}
			</span>
		</template>

		<template #cell-promo_code="{ row }">
			<span class="text-gray-700">
				{{ toDiscount(row).requires_promo_code ? toDiscount(row).promo_code || '—' : '—' }}
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
