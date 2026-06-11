<script setup lang="ts">
	import DataTable from '@/shared/ui/DataTable.vue'
	import TableRowActions from '@/shared/ui/TableRowActions.vue'

	import { PERMISSIONS_TABLE_COLUMNS } from '../helpers'
	import type { Permission } from '../types'

	defineProps<{
		permissions: Permission[]
		loading: boolean
		pagination: { limit: number; offset: number }
	}>()

	defineEmits<{
		(e: 'edit', permission: Permission): void
		(e: 'delete', permission: Permission): void
	}>()

	const toPermission = (row: unknown) => row as Permission
</script>

<template>
	<DataTable
		:columns="PERMISSIONS_TABLE_COLUMNS"
		:rows="permissions"
		:loading="loading"
		empty-text="Пока нет permissions."
		:pagination="pagination"
		clickable
		@row-click="(row) => $emit('edit', toPermission(row))"
	>
		<template #cell-name="{ row }">
			<span class="font-medium text-gray-800">{{ toPermission(row).name }}</span>
		</template>

		<template #cell-actions="{ row }">
			<TableRowActions @delete="$emit('delete', toPermission(row))" />
		</template>
	</DataTable>
</template>
