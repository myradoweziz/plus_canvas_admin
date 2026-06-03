<script setup lang="ts">
	import Button from '@/shared/ui/Button.vue'
	import DataTable from '@/shared/ui/DataTable.vue'
	import StatusBadge from '@/shared/ui/StatusBadge.vue'

	import { EditIcon, TrashIcon } from '@/shared/icons'
	import { STORES_TABLE_COLUMNS } from '../../helpers'
	import type { Store } from '../../types'

	defineProps<{
		items: Store[]
		loading: boolean
	}>()

	defineEmits<{
		(e: 'edit', item: Store): void
		(e: 'delete', item: Store): void
	}>()

	const toStore = (row: unknown) => row as Store
	const badgeClass = (value: boolean) => (value ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700')
</script>

<template>
	<DataTable :columns="STORES_TABLE_COLUMNS" :rows="items" :loading="loading" empty-text="Пока нет магазинов.">
		<template #cell-name="{ row }">
			<span class="font-medium text-gray-800">{{ toStore(row).name }}</span>
		</template>

		<template #cell-url="{ row }">
			<span class="text-gray-700">{{ toStore(row).url }}</span>
		</template>

		<template #cell-ssl_enabled="{ row }">
			<StatusBadge :tone-class="badgeClass(toStore(row).ssl_enabled)">
				{{ toStore(row).ssl_enabled ? 'Да' : 'Нет' }}
			</StatusBadge>
		</template>

		<template #cell-display_order="{ row }">
			<span class="text-gray-700">{{ toStore(row).display_order }}</span>
		</template>

		<template #cell-actions="{ row }">
			<div class="flex items-center justify-end gap-2">
				<Button
					type="button"
					variant="ghost"
					size="icon"
					class-name="hover:bg-green-100"
					aria-label="Edit"
					:on-click="() => $emit('edit', toStore(row))"
				>
					<EditIcon />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					class-name="hover:text-red-700"
					aria-label="Delete"
					:on-click="() => $emit('delete', toStore(row))"
				>
					<TrashIcon />
				</Button>
			</div>
		</template>
	</DataTable>
</template>
