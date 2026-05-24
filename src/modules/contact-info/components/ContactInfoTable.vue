<script setup lang="ts">
	import Button from '@/shared/ui/Button.vue'
	import DataTable from '@/shared/ui/DataTable.vue'

	import { EditIcon } from '@/shared/icons'
	import { CONTACT_INFO_TABLE_COLUMNS } from '../helpers'
	import type { ContactInfo } from '../types'

	defineProps<{
		rows: ContactInfo[]
		loading?: boolean
	}>()

	defineEmits<{
		(e: 'edit', row: ContactInfo): void
	}>()
</script>

<template>
	<DataTable :columns="CONTACT_INFO_TABLE_COLUMNS" :rows="rows" :loading="loading" empty-text="Пока нет данных.">
		<template #cell-social_links="{ row }">
			<div v-if="(row as ContactInfo).social_links?.length" class="flex flex-wrap gap-1">
				<span
					v-for="(link, i) in (row as ContactInfo).social_links"
					:key="i"
					class="inline-flex max-w-[140px] truncate rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
					:title="link.url"
				>
					{{ link.platform || '—' }}
				</span>
			</div>
			<span v-else class="text-sm text-gray-400">—</span>
		</template>
		<template #cell-actions="{ row }">
			<Button type="button" variant="ghost" size="sm" :on-click="() => $emit('edit', row as ContactInfo)">
				<EditIcon />
			</Button>
		</template>
	</DataTable>
</template>
