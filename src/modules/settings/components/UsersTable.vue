<script setup lang="ts">
	import Button from '@/shared/ui/Button.vue'
	import DataTable from '@/shared/ui/DataTable.vue'

	import { EditIcon, TrashIcon } from '@/shared/icons'
	import { USERS_TABLE_COLUMNS } from '../helpers/users'
	import type { User } from '../types/user'

	defineProps<{
		users: User[]
		loading: boolean
		pagination: { limit: number; offset: number }
	}>()

	defineEmits<{
		(e: 'edit', user: User): void
		(e: 'delete', user: User): void
	}>()

	const toUser = (row: unknown) => row as User
</script>

<template>
	<DataTable :columns="USERS_TABLE_COLUMNS" :rows="users" :loading="loading" empty-text="Пока нет users." :pagination="pagination">
		<template #cell-name="{ row }">
			<span class="font-medium text-gray-800">{{ toUser(row).name }}</span>
		</template>

		<template #cell-email="{ row }">
			<span class="text-gray-700">{{ toUser(row).email }}</span>
		</template>

		<template #cell-phone_number="{ row }">
			<span class="text-gray-700">{{ toUser(row).phone_number }}</span>
		</template>

		<template #cell-roles="{ row }">
			<span class="text-gray-700">{{ (toUser(row).roles || []).join(', ') }}</span>
		</template>

		<template #cell-actions="{ row }">
			<div class="flex items-center justify-end gap-2">
				<Button
					type="button"
					variant="ghost"
					size="icon"
					class-name="hover:bg-green-100"
					aria-label="Edit"
					:on-click="() => $emit('edit', toUser(row))"
				>
					<EditIcon />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					class-name="hover:text-red-700"
					aria-label="Delete"
					:on-click="() => $emit('delete', toUser(row))"
				>
					<TrashIcon />
				</Button>
			</div>
		</template>
	</DataTable>
</template>

