<script setup lang="ts">
	import DataTable from '@/shared/ui/DataTable.vue'
	import StatusBadge from '@/shared/ui/StatusBadge.vue'
	import TableRowActions from '@/shared/ui/TableRowActions.vue'
	import { COUPONS_TABLE_COLUMNS, formatCouponAmount, formatDiscountPeriod } from '../helpers'
	import type { Coupon } from '../types'

	defineProps<{
		coupons: Coupon[]
		loading: boolean
	}>()

	const emit = defineEmits<{
		(e: 'edit', coupon: Coupon): void
		(e: 'delete', coupon: Coupon): void
	}>()

	const toCoupon = (row: unknown) => row as Coupon

	const formatUsers = (coupon: Coupon) => {
		if (coupon.users?.length) {
			return coupon.users.map((user) => user.email || user.name || `#${user.id}`).join(', ')
		}
		if (coupon.user_ids?.length) {
			return coupon.user_ids.map((id) => `#${id}`).join(', ')
		}
		return '—'
	}
</script>

<template>
	<DataTable
		:columns="COUPONS_TABLE_COLUMNS"
		:rows="coupons"
		:loading="loading"
		empty-text="Пока нет купонов."
		clickable
		@row-click="(row) => emit('edit', toCoupon(row))"
	>
		<template #cell-code="{ row }">
			<span class="font-medium text-gray-800">{{ toCoupon(row).code }}</span>
		</template>

		<template #cell-discount_type="{ row }">
			<span class="text-gray-700">
				{{
					toCoupon(row).discount_type?.name ??
					(toCoupon(row).discount_type_id ? `#${toCoupon(row).discount_type_id}` : '—')
				}}
			</span>
		</template>

		<template #cell-amount="{ row }">
			<span class="text-gray-700">{{ formatCouponAmount(toCoupon(row)) }}</span>
		</template>

		<template #cell-usage_limit="{ row }">
			<span class="text-gray-700">{{ toCoupon(row).usage_limit || '—' }}</span>
		</template>

		<template #cell-period="{ row }">
			<span class="text-gray-700">
				{{ formatDiscountPeriod(toCoupon(row).start_date, toCoupon(row).end_date) }}
			</span>
		</template>

		<template #cell-user="{ row }">
			<span class="text-gray-700">{{ formatUsers(toCoupon(row)) }}</span>
		</template>

		<template #cell-is_active="{ row }">
			<StatusBadge
				:tone-class="toCoupon(row).is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'"
			>
				{{ toCoupon(row).is_active ? 'Активен' : 'Не активен' }}
			</StatusBadge>
		</template>

		<template #cell-actions="{ row }">
			<TableRowActions @delete="emit('delete', toCoupon(row))" />
		</template>
	</DataTable>
</template>
