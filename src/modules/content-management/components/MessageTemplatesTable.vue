<script setup lang="ts">
	import Button from '@/shared/ui/Button.vue'
	import DataTable from '@/shared/ui/DataTable.vue'
	import StatusBadge from '@/shared/ui/StatusBadge.vue'

	import { EditIcon, TrashIcon } from '@/shared/icons'
	import { MESSAGE_TEMPLATES_TABLE_COLUMNS } from '../helpers'
	import type { MessageTemplate } from '../types'

	defineProps<{
		templates: MessageTemplate[]
		loading: boolean
	}>()

	defineEmits<{
		(e: 'edit', template: MessageTemplate): void
		(e: 'delete', template: MessageTemplate): void
	}>()

	const toTemplate = (row: unknown) => row as MessageTemplate
	const badgeClass = (value: boolean) => (value ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700')
</script>

<template>
	<DataTable :columns="MESSAGE_TEMPLATES_TABLE_COLUMNS" :rows="templates" :loading="loading" empty-text="Пока нет шаблонов.">
		<template #cell-name="{ row }">
			<span class="font-medium text-gray-800">{{ toTemplate(row).name }}</span>
		</template>

		<template #cell-subject="{ row }">
			<span class="text-gray-700">{{ toTemplate(row).subject }}</span>
		</template>

		<template #cell-store_id="{ row }">
			<span class="text-gray-700">{{ toTemplate(row).store_id }}</span>
		</template>

		<template #cell-is_active="{ row }">
			<StatusBadge :tone-class="badgeClass(toTemplate(row).is_active)">
				{{ toTemplate(row).is_active ? 'Да' : 'Нет' }}
			</StatusBadge>
		</template>

		<template #cell-actions="{ row }">
			<div class="flex items-center justify-end gap-2">
				<Button
					type="button"
					variant="ghost"
					size="icon"
					class-name="hover:bg-green-100"
					aria-label="Edit"
					:on-click="() => $emit('edit', toTemplate(row))"
				>
					<EditIcon />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					class-name="hover:bg-red-100"
					aria-label="Delete"
					:on-click="() => $emit('delete', toTemplate(row))"
				>
					<TrashIcon />
				</Button>
			</div>
		</template>
	</DataTable>
</template>

