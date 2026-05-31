<script setup lang="ts">
	import Button from '@/shared/ui/Button.vue'
	import DataTable from '@/shared/ui/DataTable.vue'
	import StatusBadge from '@/shared/ui/StatusBadge.vue'

	import { EditIcon, TrashIcon } from '@/shared/icons'
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
			<div class="flex items-center justify-end gap-2">
				<Button
					type="button"
					variant="ghost"
					size="icon"
					class-name="hover:bg-green-100"
					aria-label="Редактировать"
					:on-click="() => emit('edit', toSubscriber(row))"
				>
					<EditIcon />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					class-name="hover:text-red-700"
					aria-label="Удалить"
					:on-click="() => emit('delete', toSubscriber(row))"
				>
					<TrashIcon />
				</Button>
			</div>
		</template>
	</DataTable>
</template>
