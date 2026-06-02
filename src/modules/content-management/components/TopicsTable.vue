<script setup lang="ts">
	import Button from '@/shared/ui/Button.vue'
	import DataTable from '@/shared/ui/DataTable.vue'
	import StatusBadge from '@/shared/ui/StatusBadge.vue'

	import { EditIcon, TrashIcon } from '@/shared/icons'
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
	<DataTable :columns="TOPICS_TABLE_COLUMNS" :rows="topics" :loading="loading" empty-text="Пока нет тем.">
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
			<div class="flex items-center justify-end gap-2">
				<Button
					type="button"
					variant="ghost"
					size="icon"
					class-name="hover:bg-green-100"
					aria-label="Edit"
					:on-click="() => $emit('edit', toTopic(row))"
				>
					<EditIcon />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					class-name="hover:bg-red-100"
					aria-label="Delete"
					:on-click="() => $emit('delete', toTopic(row))"
				>
					<TrashIcon />
				</Button>
			</div>
		</template>
	</DataTable>
</template>
