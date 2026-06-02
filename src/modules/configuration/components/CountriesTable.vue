<script setup lang="ts">
	import Button from '@/shared/ui/Button.vue'
	import DataTable from '@/shared/ui/DataTable.vue'
	import StatusBadge from '@/shared/ui/StatusBadge.vue'

	import { EditIcon, TrashIcon } from '@/shared/icons'
	import { COUNTRIES_TABLE_COLUMNS } from '../helpers'
	import type { Country } from '../types'

	defineProps<{
		items: Country[]
		loading: boolean
	}>()

	defineEmits<{
		(e: 'edit', item: Country): void
		(e: 'delete', item: Country): void
	}>()

	const toItem = (row: unknown) => row as Country
	const badgeClass = (value: boolean) => (value ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700')
</script>

<template>
	<DataTable :columns="COUNTRIES_TABLE_COLUMNS" :rows="items" :loading="loading" empty-text="Пока нет стран.">
		<template #cell-name="{ row }">
			<span class="font-medium text-gray-800">{{ toItem(row).name }}</span>
		</template>

		<template #cell-two_letter_iso_code="{ row }">
			<span class="text-gray-700">{{ toItem(row).two_letter_iso_code }}</span>
		</template>

		<template #cell-three_letter_iso_code="{ row }">
			<span class="text-gray-700">{{ toItem(row).three_letter_iso_code }}</span>
		</template>

		<template #cell-numeric_iso_code="{ row }">
			<span class="text-gray-700">{{ toItem(row).numeric_iso_code }}</span>
		</template>

		<template #cell-published="{ row }">
			<StatusBadge :tone-class="badgeClass(toItem(row).published)">
				{{ toItem(row).published ? 'Опубликован' : 'Не опубликован' }}
			</StatusBadge>
		</template>

		<template #cell-display_order="{ row }">
			<span class="text-gray-700">{{ toItem(row).display_order }}</span>
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
