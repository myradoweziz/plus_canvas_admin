<script setup lang="ts">
	import DataTable from '@/shared/ui/DataTable.vue'
	import TableRowActions from '@/shared/ui/TableRowActions.vue'
	import StatusBadge from '@/shared/ui/StatusBadge.vue'

	import { TOPICS_TABLE_COLUMNS } from '../helpers'
	import type { Topic } from '../types'

	defineProps<{
		topics: Topic[]
		loading: boolean
	}>()

	defineEmits<{
		(e: 'edit', topic: Topic): void
		(e: 'delete', topic: Topic): void
	}>()

	const toTopic = (row: unknown) => row as Topic

	const badgeClass = (value: boolean) => (value ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700')
</script>

<template>
	<DataTable :columns="TOPICS_TABLE_COLUMNS" :rows="topics" :loading="loading" empty-text="Пока нет тем."
		clickable
		@row-click="(row) => $emit('edit', toTopic(row))">
		<template #cell-system_name="{ row }">
			<span class="font-medium text-gray-800">{{ toTopic(row).system_name }}</span>
		</template>

		<template #cell-include_in_sitemap="{ row }">
			<StatusBadge :tone-class="badgeClass(toTopic(row).include_in_sitemap)">
				{{ toTopic(row).include_in_sitemap ? 'Да' : 'Нет' }}
			</StatusBadge>
		</template>

		<template #cell-include_in_top_menu="{ row }">
			<StatusBadge :tone-class="badgeClass(toTopic(row).include_in_top_menu)">
				{{ toTopic(row).include_in_top_menu ? 'Да' : 'Нет' }}
			</StatusBadge>
		</template>

		<template #cell-actions="{ row }">
			<TableRowActions @delete="$emit('delete', toTopic(row))" />
		</template>
	</DataTable>
</template>
