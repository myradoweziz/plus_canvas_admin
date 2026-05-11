<script setup lang="ts">
	import Button from '@/shared/ui/Button.vue'
	import DataTable from '@/shared/ui/DataTable.vue'

	import { EditIcon } from '@/shared/icons'
	import { CONTACT_INFO_TABLE_COLUMNS } from '../helpers'
	import type { ContactInfo } from '../types/contact-info'

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
		<template #cell-actions="{ row }">
			<Button type="button" variant="ghost" size="sm" :on-click="() => $emit('edit', row as ContactInfo)">
				<EditIcon />
			</Button>
		</template>
	</DataTable>
</template>
