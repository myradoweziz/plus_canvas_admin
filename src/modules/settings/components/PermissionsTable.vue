<script setup lang="ts">
	import Button from '@/shared/ui/Button.vue'
	import DataTable from '@/shared/ui/DataTable.vue'

	import { EditIcon, TrashIcon } from '@/shared/icons'
	import { PERMISSIONS_TABLE_COLUMNS } from '../helpers'
	import type { Permission } from '../types/permission'

	defineProps<{
		permissions: Permission[]
		loading: boolean
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
	>
		<template #cell-name="{ row }">
			<span class="font-medium text-gray-800">{{ toPermission(row).name }}</span>
		</template>

		<template #cell-actions="{ row }">
			<div class="flex items-center justify-end gap-2">
				<Button
					type="button"
					variant="ghost"
					size="icon"
					class-name="hover:bg-green-100"
					aria-label="Edit"
					:on-click="() => $emit('edit', toPermission(row))"
				>
					<EditIcon />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					class-name="hover:text-red-700"
					aria-label="Delete"
					:on-click="() => $emit('delete', toPermission(row))"
				>
					<TrashIcon />
				</Button>
			</div>
		</template>
	</DataTable>
</template>

