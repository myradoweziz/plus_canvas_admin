<script setup lang="ts">
	import DataTable from '@/shared/ui/DataTable.vue'
	import TableRowActions from '@/shared/ui/TableRowActions.vue'
	import StatusBadge from '@/shared/ui/StatusBadge.vue'

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
	<DataTable :columns="MESSAGE_TEMPLATES_TABLE_COLUMNS" :rows="templates" :loading="loading" empty-text="Пока нет шаблонов."
		clickable
		@row-click="(row) => $emit('edit', toTemplate(row))">
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
			<TableRowActions @delete="$emit('delete', toTemplate(row))" />
		</template>
	</DataTable>
</template>

