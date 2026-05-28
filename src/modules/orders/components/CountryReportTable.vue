<script setup lang="ts">
	import DataTable from '@/shared/ui/DataTable.vue'

	import { COUNTRY_REPORT_TABLE_COLUMNS } from '../helpers'
	import type { CountryReport } from '../types'

	defineProps<{
		rows: CountryReport[]
		loading: boolean
		pagination: { limit: number; offset: number }
	}>()

	const toRow = (row: unknown) => row as CountryReport
</script>

<template>
	<DataTable
		:columns="COUNTRY_REPORT_TABLE_COLUMNS"
		:rows="rows"
		:loading="loading"
		empty-text="Нет данных по странам."
		:pagination="pagination"
	>
		<template #cell-country="{ row }">
			<span class="font-medium text-gray-800">{{ toRow(row).country }}</span>
		</template>

		<template #cell-order_count="{ row }">
			<span class="font-medium text-gray-800">{{ toRow(row).order_count }}</span>
		</template>

		<template #cell-total_amount="{ row }">
			<span class="font-medium text-gray-800">{{ toRow(row).total_amount }}</span>
		</template>

		<template #cell-map="{ row }">
			<div class="flex justify-end">
				<a
					:href="toRow(row).google_maps_url"
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
			</div>
		</template>
	</DataTable>
</template>
