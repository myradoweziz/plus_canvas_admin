<script setup lang="ts">
	import Button from '@/shared/ui/Button.vue'
	import DataTable from '@/shared/ui/DataTable.vue'

	import { EditIcon, TrashIcon } from '@/shared/icons'
	import { DELIVERY_DATES_TABLE_COLUMNS } from '../../helpers'
	import type { DeliveryDate } from '../../types'

	defineProps<{
		items: DeliveryDate[]
		loading: boolean
	}>()

	defineEmits<{
		(e: 'edit', item: DeliveryDate): void
		(e: 'delete', item: DeliveryDate): void
	}>()

	const toItem = (row: unknown) => row as DeliveryDate
</script>

<template>
	<DataTable
		:columns="DELIVERY_DATES_TABLE_COLUMNS"
		:rows="items"
		:loading="loading"
		empty-text="Пока нет сроков доставки."
	>
		<template #cell-name="{ row }">
			<span class="font-medium text-gray-800">{{ toItem(row).name }}</span>
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
					aria-label="Редактировать"
					:on-click="() => $emit('edit', toItem(row))"
				>
					<EditIcon />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					class-name="hover:text-red-700"
					aria-label="Удалить"
					:on-click="() => $emit('delete', toItem(row))"
				>
					<TrashIcon />
				</Button>
			</div>
		</template>
	</DataTable>
</template>
