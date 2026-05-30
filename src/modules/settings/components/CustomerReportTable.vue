<script setup lang="ts">
	import { useRouter } from 'vue-router'

	import Button from '@/shared/ui/Button.vue'
	import DataTable from '@/shared/ui/DataTable.vue'

	import { formatMoney } from '@/modules/orders/helpers'
	import { Eye } from '@/shared/icons'
	import { CUSTOMER_REPORT_TABLE_COLUMNS, customerReportName } from '../helpers/customer-report'
	import type { CustomerReportItem } from '../types'

	defineProps<{
		rows: CustomerReportItem[]
		loading: boolean
		pagination: { limit: number; offset: number }
	}>()

	const router = useRouter()

	const toRow = (row: unknown) => row as CustomerReportItem

	const openUser = (row: CustomerReportItem) => {
		if (row.id == null) return
		router.push(`/admin-panel/settings/users/${row.id}/edit`)
	}
</script>

<template>
	<DataTable
		:columns="CUSTOMER_REPORT_TABLE_COLUMNS"
		:rows="rows"
		:loading="loading"
		empty-text="Нет данных по пользователям."
		:pagination="pagination"
	>
		<template #cell-name="{ row }">
			<span class="font-medium text-gray-800">{{ customerReportName(toRow(row)) }}</span>
		</template>

		<template #cell-email="{ row }">
			<span class="text-gray-700">{{ toRow(row).email || '—' }}</span>
		</template>

		<template #cell-order_count="{ row }">
			<span class="font-medium text-gray-800">{{ toRow(row).order_count }}</span>
		</template>

		<template #cell-total_amount="{ row }">
			<span class="font-medium text-gray-800">{{ formatMoney(toRow(row).total_amount) }}</span>
		</template>

		<template #cell-map="{ row }">
			<div class="flex justify-end">
				<a
					v-if="toRow(row).google_maps_url"
					:href="toRow(row).google_maps_url!"
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center gap-1 rounded-lg px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
					aria-label="Open in Google Maps"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-4 w-4"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
						<circle cx="12" cy="10" r="3" />
					</svg>
					Maps
				</a>
				<span v-else class="text-sm text-gray-400">—</span>
			</div>
		</template>

		<template #cell-actions="{ row }">
			<div class="flex items-center justify-end">
				<Button
					v-if="toRow(row).id != null"
					type="button"
					variant="ghost"
					size="icon"
					class-name="hover:bg-blue-100"
					aria-label="Открыть пользователя"
					:on-click="() => openUser(toRow(row))"
				>
					<Eye />
				</Button>
				<span v-else class="text-sm text-gray-400">—</span>
			</div>
		</template>
	</DataTable>
</template>
