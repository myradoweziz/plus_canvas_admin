<script setup lang="ts">
	import DataTable from '@/shared/ui/DataTable.vue'
	import TableRowActions from '@/shared/ui/TableRowActions.vue'
	import { NAME_SLUG_TABLE_COLUMNS } from '../../helpers'
	import type { NameSlugEntity } from '../../types'

	defineProps<{
		items: NameSlugEntity[]
		loading: boolean
		emptyText?: string
	}>()

	const emit = defineEmits<{
		(e: 'edit', item: NameSlugEntity): void
		(e: 'delete', item: NameSlugEntity): void
	}>()

	const toItem = (row: unknown) => row as NameSlugEntity
</script>

<template>
	<DataTable
		:columns="NAME_SLUG_TABLE_COLUMNS"
		:rows="items"
		:loading="loading"
		:empty-text="emptyText ?? 'Пока нет записей.'"
		clickable
		@row-click="(row) => emit('edit', toItem(row))"
	>
		<template #cell-name="{ row }">
			<span class="font-medium text-gray-800">{{ toItem(row).name }}</span>
		</template>

		<template #cell-slug="{ row }">
			<span class="text-gray-700">{{ toItem(row).slug }}</span>
		</template>

		<template #cell-actions="{ row }">
			<TableRowActions @delete="emit('delete', toItem(row))" />
		</template>
	</DataTable>
</template>
