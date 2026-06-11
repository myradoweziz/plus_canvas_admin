<script setup lang="ts">
	import DataTable from '@/shared/ui/DataTable.vue'
	import StatusBadge from '@/shared/ui/StatusBadge.vue'

	import TableRowActions from '@/shared/ui/TableRowActions.vue'
	import { formatNewsletterSubscriberDate, NEWSLETTER_SUBSCRIBERS_TABLE_COLUMNS } from '../helpers'
	import type { NewsletterSubscriber } from '../types'

	defineProps<{
		subscribers: NewsletterSubscriber[]
		loading: boolean
		pagination: { limit: number; offset: number }
	}>()

	const emit = defineEmits<{
		(e: 'edit', subscriber: NewsletterSubscriber): void
		(e: 'delete', subscriber: NewsletterSubscriber): void
	}>()

	const toSubscriber = (row: unknown) => row as NewsletterSubscriber
</script>

<template>
	<DataTable
		:columns="NEWSLETTER_SUBSCRIBERS_TABLE_COLUMNS"
		:rows="subscribers"
		:loading="loading"
		empty-text="Подписчиков пока нет."
		:pagination="pagination"
		clickable
		@row-click="(row) => emit('edit', toSubscriber(row))"
	>
		<template #cell-email="{ row }">
			<span class="text-gray-700">{{ toSubscriber(row).email || '—' }}</span>
		</template>

		<template #cell-is_active="{ row }">
			<StatusBadge
				:tone-class="toSubscriber(row).is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
			>
				{{ toSubscriber(row).is_active ? 'Активен' : 'Неактивен' }}
			</StatusBadge>
		</template>

		<template #cell-created_at="{ row }">
			<span class="text-gray-700">{{ formatNewsletterSubscriberDate(toSubscriber(row).created_at) }}</span>
		</template>

		<template #cell-actions="{ row }">
			<TableRowActions @delete="emit('delete', toSubscriber(row))" />
		</template>
	</DataTable>
</template>
