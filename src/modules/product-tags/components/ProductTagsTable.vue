<script setup lang="ts">
	import DataTable from '@/shared/ui/DataTable.vue'
	import TableRowActions from '@/shared/ui/TableRowActions.vue'

	import { PRODUCT_TAGS_TABLE_COLUMNS } from '../helpers'
	import type { ProductTag } from '../types'

	defineProps<{
		tags: ProductTag[]
		loading: boolean
		pagination: { limit: number; offset: number }
	}>()

	const emit = defineEmits<{
		(e: 'edit', tag: ProductTag): void
		(e: 'delete', tag: ProductTag): void
	}>()

	const toTag = (row: unknown) => row as ProductTag
</script>

<template>
	<DataTable
		:columns="PRODUCT_TAGS_TABLE_COLUMNS"
		:rows="tags"
		:loading="loading"
		empty-text="Пока нет тегов."
		:pagination="pagination"
		clickable
		@row-click="(row) => emit('edit', toTag(row))"
	>
		<template #cell-name="{ row }">
			<span class="font-medium text-gray-800">{{ toTag(row).name }}</span>
		</template>

		<template #cell-slug="{ row }">
			<span class="text-gray-700">{{ toTag(row).slug }}</span>
		</template>

		<template #cell-products_count="{ row }">
			<span class="text-gray-700">{{ toTag(row).products_count }}</span>
		</template>

		<template #cell-actions="{ row }">
			<TableRowActions @delete="emit('delete', toTag(row))" />
		</template>
	</DataTable>
</template>
