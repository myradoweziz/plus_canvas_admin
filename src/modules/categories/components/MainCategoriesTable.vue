<script setup lang="ts">
	import Button from '@/shared/ui/Button.vue'
	import DataTable from '@/shared/ui/DataTable.vue'

	import { EditIcon, TrashIcon } from '@/shared/icons'
	import { MAIN_CATEGORIES_TABLE_COLUMNS } from '../helpers'
	import type { MainCategory } from '../types/category'

	defineProps<{
		categories: MainCategory[]
		loading: boolean
	}>()

	const toMainCategory = (row: unknown) => row as MainCategory

	const emit = defineEmits<{
		(e: 'edit', mainCategory: MainCategory): void
		(e: 'delete', mainCategory: MainCategory): void
		(e: 'reorder', mainCategories: MainCategory[]): void
	}>()

	const onReorder = (rows: unknown[]) => {
		emit('reorder', rows as MainCategory[])
	}
</script>

<template>
	<DataTable
		:columns="MAIN_CATEGORIES_TABLE_COLUMNS"
		:rows="categories"
		:loading="loading"
		empty-text="Пока нет категорий."
		draggable
		order-key="featured_order"
		@reorder="onReorder"
	>
		<template #cell-name="{ row }">
			<span class="font-medium text-gray-800">{{ toMainCategory(row).name }}</span>
		</template>

		<template #cell-slug="{ row }">
			<span class="text-gray-700">{{ toMainCategory(row).slug }}</span>
		</template>

		<template #cell-is_active="{ row }">
			<span
				class="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold"
				:class="toMainCategory(row).is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'"
			>
				{{ toMainCategory(row).is_active ? 'true' : 'false' }}
			</span>
		</template>

		<template #cell-featured_order="{ row }">
			<span class="text-gray-700">{{ toMainCategory(row).featured_order }}</span>
		</template>

		<template #cell-actions="{ row }">
			<div class="flex items-center justify-end gap-2">
				<Button
					type="button"
					variant="ghost"
					size="icon"
					class-name="hover:bg-green-100"
					aria-label="Edit"
					:on-click="() => $emit('edit', toMainCategory(row))"
				>
					<EditIcon />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					class-name="hover:text-red-700"
					aria-label="Delete"
					:on-click="() => $emit('delete', toMainCategory(row))"
				>
					<TrashIcon />
				</Button>
			</div>
		</template>
	</DataTable>
</template>
