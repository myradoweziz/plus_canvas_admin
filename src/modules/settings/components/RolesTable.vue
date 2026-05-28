<script setup lang="ts">
	import Button from '@/shared/ui/Button.vue'
	import DataTable from '@/shared/ui/DataTable.vue'

	import { EditIcon, TrashIcon } from '@/shared/icons'
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
	<DataTable :columns="ROLES_TABLE_COLUMNS" :rows="roles" :loading="loading" empty-text="Пока нет roles." :pagination="pagination">
		<template #cell-name="{ row }">
			<span class="font-medium text-gray-800">{{ toRole(row).name }}</span>
		</template>

		<template #cell-permissions="{ row }">
			<span class="text-gray-700">{{ (toRole(row).permissions || []).join(', ') }}</span>
		</template>

		<template #cell-actions="{ row }">
			<div class="flex items-center justify-end gap-2">
				<Button
					type="button"
					variant="ghost"
					size="icon"
					class-name="hover:bg-green-100"
					aria-label="Edit"
					:on-click="() => $emit('edit', toRole(row))"
				>
					<EditIcon />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					class-name="hover:text-red-700"
					aria-label="Delete"
					:on-click="() => $emit('delete', toRole(row))"
				>
					<TrashIcon />
				</Button>
			</div>
		</template>
	</DataTable>
</template>
