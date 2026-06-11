<script setup lang="ts">
	import DataTable from '@/shared/ui/DataTable.vue'
	import StatusBadge from '@/shared/ui/StatusBadge.vue'
	import TableRowActions from '@/shared/ui/TableRowActions.vue'
	import { ROLES_TABLE_COLUMNS } from '../helpers'
	import type { Role } from '../types'

	defineProps<{
		roles: Role[]
		loading: boolean
		pagination: { limit: number; offset: number }
	}>()

	defineEmits<{
		(e: 'edit', role: Role): void
		(e: 'delete', role: Role): void
	}>()

	const toRole = (row: unknown) => row as Role
</script>

<template>
	<DataTable
		:columns="ROLES_TABLE_COLUMNS"
		:rows="roles"
		:loading="loading"
		empty-text="Пока нет roles."
		:pagination="pagination"
		clickable
		@row-click="(row) => $emit('edit', toRole(row))"
	>
		<template #cell-name="{ row }">
			<span class="font-medium text-gray-800">{{ toRole(row).name }}</span>
		</template>

		<template #cell-active="{ row }">
			<StatusBadge :tone-class="toRole(row).active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'">
				{{ toRole(row).active ? 'Активно' : 'Не активно' }}
			</StatusBadge>
		</template>

		<template #cell-permissions="{ row }">
			<span class="text-gray-700">{{ (toRole(row).permissions || []).join(', ') }}</span>
		</template>

		<template #cell-actions="{ row }">
			<TableRowActions @delete="$emit('delete', toRole(row))" />
		</template>
	</DataTable>
</template>
