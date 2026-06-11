<script setup lang="ts">
	import DataTable from '@/shared/ui/DataTable.vue'
	import TableRowActions from '@/shared/ui/TableRowActions.vue'
	import StatusBadge from '@/shared/ui/StatusBadge.vue'

	import { COUNTRY_STATES_TABLE_COLUMNS } from '../../helpers'
	import type { CountryState } from '../../types'

	defineProps<{
		items: CountryState[]
		loading: boolean
	}>()

	defineEmits<{
		(e: 'edit', item: CountryState): void
		(e: 'delete', item: CountryState): void
	}>()

	const toItem = (row: unknown) => row as CountryState
	const badgeClass = (value: boolean) => (value ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700')
</script>

<template>
	<DataTable
		:columns="COUNTRY_STATES_TABLE_COLUMNS"
		:rows="items"
		:loading="loading"
		empty-text="Регионов пока нет."
		:pagination="{ limit: items.length || 1, offset: 0 }"
		clickable
		@row-click="(row) => $emit('edit', toItem(row))"
	>
		<template #cell-name="{ row }">
			<span class="font-medium text-gray-800">{{ toItem(row).name }}</span>
		</template>

		<template #cell-abbreviation="{ row }">
			<span class="text-gray-700">{{ toItem(row).abbreviation }}</span>
		</template>

		<template #cell-published="{ row }">
			<StatusBadge :tone-class="badgeClass(toItem(row).published)">
				{{ toItem(row).published ? 'Опубликован' : 'Не опубликован' }}
			</StatusBadge>
		</template>

		<template #cell-display_order="{ row }">
			<span class="text-gray-700">{{ toItem(row).display_order }}</span>
		</template>

		<template #cell-actions="{ row }">
			<TableRowActions @delete="$emit('delete', toItem(row))" />
		</template>
	</DataTable>
</template>
