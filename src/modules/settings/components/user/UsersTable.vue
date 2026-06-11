<script setup lang="ts">
	import DataTable from '@/shared/ui/DataTable.vue'
	import TableRowActions from '@/shared/ui/TableRowActions.vue'
	import StatusBadge from '@/shared/ui/StatusBadge.vue'

	import { formatUserDate, userDisplayName, USERS_TABLE_COLUMNS } from '../../helpers/users'
	import type { User } from '../../types/user'

	defineProps<{
		users: User[]
		loading: boolean
		pagination: { limit: number; offset: number }
		selectedUsers?: User[]
	}>()

	const emit = defineEmits<{
		(e: 'edit', user: User): void
		(e: 'update:selectedUsers', users: User[]): void
		(e: 'delete', user: User): void
	}>()

	const onUpdateSelected = (rows: unknown[]) => {
		emit('update:selectedUsers', rows as User[])
	}

	const toUser = (row: unknown) => row as User
</script>

<template>
	<DataTable
		:columns="USERS_TABLE_COLUMNS"
		:rows="users"
		:loading="loading"
		empty-text="Пока нет пользователей."
		:pagination="pagination"
		selectable
		:selected-rows="selectedUsers"
		@update:selected-rows="onUpdateSelected"
		clickable
		@row-click="(row) => emit('edit', toUser(row))"
	>
		<template #cell-email="{ row }">
			<span class="text-gray-700">{{ toUser(row).email || '—' }}</span>
		</template>

		<template #cell-name="{ row }">
			<span class="font-medium text-gray-800">{{ userDisplayName(toUser(row)) }}</span>
		</template>

		<template #cell-roles="{ row }">
			<span class="text-gray-700">{{ (toUser(row).roles || []).join(', ') || '—' }}</span>
		</template>

		<template #cell-phone_number="{ row }">
			<span class="text-gray-700">{{ toUser(row).phone_number || '—' }}</span>
		</template>

		<template #cell-is_active="{ row }">
			<StatusBadge :tone-class="toUser(row).is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
				{{ toUser(row).is_active ? 'Активен' : 'Не активен' }}
			</StatusBadge>
		</template>

		<template #cell-created_at="{ row }">
			<span class="text-gray-700">{{ formatUserDate(toUser(row).created_at) }}</span>
		</template>

		<template #cell-last_activity_at="{ row }">
			<span class="text-gray-700">{{ formatUserDate(toUser(row).last_activity_at) }}</span>
		</template>

		<template #cell-actions="{ row }">
			<TableRowActions @delete="emit('delete', toUser(row))" />
		</template>
	</DataTable>
</template>
