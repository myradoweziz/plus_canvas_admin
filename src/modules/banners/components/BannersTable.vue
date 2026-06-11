<script setup lang="ts">
	import DataTable from '@/shared/ui/DataTable.vue'
	import TableRowActions from '@/shared/ui/TableRowActions.vue'
	import StatusBadge from '@/shared/ui/StatusBadge.vue'

	import { BANNERS_TABLE_COLUMNS } from '../helpers'
	import type { Banner } from '../types'

	const props = defineProps<{
		banners: Banner[]
		loading: boolean
	}>()

	const emit = defineEmits<{
		(e: 'add'): void
		(e: 'edit', banner: Banner): void
		(e: 'delete', banner: Banner): void
		(e: 'reorder', banners: Banner[]): void
	}>()

	const toBanner = (row: unknown) => row as Banner

	const onReorder = (rows: unknown[]) => {
		emit('reorder', rows as Banner[])
	}
</script>

<template>
	<DataTable
		:columns="BANNERS_TABLE_COLUMNS"
		:rows="banners"
		:loading="loading"
		empty-text="Пока нет баннеров."
		draggable
		order-key="order"
		@reorder="onReorder"
	>
		<template #cell-title="{ row }">
			<span class="text-gray-800">{{ toBanner(row).title }}</span>
		</template>

		<template #cell-image_url="{ row }">
			<img :src="toBanner(row).image_url" alt="Banner Image" class="h-40 w-40 object-contain" />
		</template>

		<template #cell-url="{ row }">
			<span class="text-gray-700">{{ toBanner(row).url }}</span>
		</template>

		<template #cell-order="{ row }">
			<span class="text-gray-700">{{ toBanner(row).order }}</span>
		</template>

		<template #cell-is_active="{ row }">
			<StatusBadge :tone-class="toBanner(row).is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'">
				{{ toBanner(row).is_active ? 'Опубликован' : 'Не опубликован' }}
			</StatusBadge>
		</template>

		<template #cell-actions="{ row }">
			<TableRowActions show-edit @edit="emit('edit', toBanner(row))" @delete="emit('delete', toBanner(row))" />
		</template>
	</DataTable>
</template>
