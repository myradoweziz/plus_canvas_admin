<script setup lang="ts">
	import Button from '@/shared/ui/Button.vue'
	import DataTable from '@/shared/ui/DataTable.vue'

	import { EditIcon, TrashIcon } from '@/shared/icons'
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
	>
		<template #cell-name="{ row }">
			<span class="font-medium text-gray-800">{{ toItem(row).name }}</span>
		</template>

		<template #cell-slug="{ row }">
			<span class="text-gray-700">{{ toItem(row).slug }}</span>
		</template>

		<template #cell-actions="{ row }">
			<div class="flex items-center justify-end gap-2">
				<Button
					type="button"
					variant="ghost"
					size="icon"
					class-name="hover:bg-green-100"
					aria-label="Edit"
					:on-click="() => $emit('edit', toItem(row))"
				>
					<EditIcon />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					class-name="hover:text-red-700"
					aria-label="Delete"
					:on-click="() => $emit('delete', toItem(row))"
				>
					<TrashIcon />
				</Button>
			</div>
		</template>
	</DataTable>
</template>
