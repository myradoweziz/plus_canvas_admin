<script setup lang="ts">
	import Button from '@/shared/ui/Button.vue'
	import DataTable from '@/shared/ui/DataTable.vue'

	import { EditIcon, TrashIcon } from '@/shared/icons'
	import { PRODUCT_TAGS_TABLE_COLUMNS } from '../helpers'
	import type { ProductTag } from '../types/productTag'

	defineProps<{
		tags: ProductTag[]
		loading: boolean
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
			<div class="flex items-center justify-end gap-2">
				<Button
					type="button"
					variant="ghost"
					size="icon"
					class-name="hover:bg-green-100"
					aria-label="Edit"
					:on-click="() => $emit('edit', toTag(row))"
				>
					<EditIcon />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					class-name="hover:text-red-700"
					aria-label="Delete"
					:on-click="() => $emit('delete', toTag(row))"
				>
					<TrashIcon />
				</Button>
			</div>
		</template>
	</DataTable>
</template>
