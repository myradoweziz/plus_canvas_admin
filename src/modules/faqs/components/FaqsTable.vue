<script setup lang="ts">
	import Button from '@/shared/ui/Button.vue'
	import DataTable from '@/shared/ui/DataTable.vue'
	import StatusBadge from '@/shared/ui/StatusBadge.vue'

	import { EditIcon, TrashIcon } from '@/shared/icons'
	import { FAQS_TABLE_COLUMNS } from '../helpers'
	import type { Faq } from '../types'

	defineProps<{
		faqs: Faq[]
		loading: boolean
		pagination: { limit: number; offset: number }
	}>()

	defineEmits<{
		(e: 'edit', faq: Faq): void
		(e: 'delete', faq: Faq): void
		(e: 'reorder', faqs: Faq[]): void
	}>()

	const toFaq = (row: unknown) => row as Faq
</script>

<template>
	<DataTable
		:columns="FAQS_TABLE_COLUMNS"
		:rows="faqs"
		:loading="loading"
		empty-text="Пока нет FAQ."
		draggable
		order-key="order"
		:pagination="pagination"
		@reorder="(rows) => $emit('reorder', rows as Faq[])"
	>
		<template #cell-question="{ row }">
			<span class="font-medium text-gray-800">{{ toFaq(row).question }}</span>
		</template>

		<template #cell-answer="{ row }">
			<span class="text-gray-700 line-clamp-2">{{ toFaq(row).answer }}</span>
		</template>

		<template #cell-is_active="{ row }">
			<StatusBadge :tone-class="toFaq(row).is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'">
				{{ toFaq(row).is_active ? 'Опубликован' : 'Не опубликован' }}
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
					:on-click="() => $emit('edit', toFaq(row))"
				>
					<EditIcon />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					class-name="hover:text-red-700"
					aria-label="Delete"
					:on-click="() => $emit('delete', toFaq(row))"
				>
					<TrashIcon />
				</Button>
			</div>
		</template>
	</DataTable>
</template>
