<script setup lang="ts">
	import DataTable from '@/shared/ui/DataTable.vue'
	import StatusBadge from '@/shared/ui/StatusBadge.vue'

	import TableRowActions from '@/shared/ui/TableRowActions.vue'
	import { MAIN_CATEGORIES_TABLE_COLUMNS } from '../helpers'
	import type { MainCategory } from '../types'

	defineProps<{
		categories: MainCategory[]
		loading: boolean
		pagination: { limit: number; offset: number }
		selectedCategories?: MainCategory[]
	}>()

	const toMainCategory = (row: unknown) => row as MainCategory

	const emit = defineEmits<{
		(e: 'edit', mainCategory: MainCategory): void
		(e: 'delete', mainCategory: MainCategory): void
		(e: 'reorder', mainCategories: MainCategory[]): void
		(e: 'update:selectedCategories', categories: MainCategory[]): void
	}>()

	const onUpdateSelected = (rows: unknown[]) => {
		emit('update:selectedCategories', rows as MainCategory[])
	}

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
		selectable
		draggable
		order-key="featured_order"
		:selected-rows="selectedCategories"
		:pagination="pagination"
		@reorder="onReorder"
		@update:selected-rows="onUpdateSelected"
	>
		<template #cell-name="{ row }">
			<span class="font-medium text-gray-800">{{ toMainCategory(row).name }}</span>
		</template>

		<template #cell-slug="{ row }">
			<span class="text-gray-700">{{ toMainCategory(row).slug }}</span>
		</template>

		<template #cell-category_type="{ row }">
			<span class="text-gray-700">{{ toMainCategory(row).category_type }}</span>
		</template>

		<template #cell-is_active="{ row }">
			<StatusBadge
				:tone-class="toMainCategory(row).is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'"
			>
				{{ toMainCategory(row).is_active ? 'Активно' : 'Не активно' }}
			</StatusBadge>
		</template>

		<template #cell-featured_order="{ row }">
			<span class="text-gray-700">{{ toMainCategory(row).featured_order }}</span>
		</template>

		<template #cell-actions="{ row }">
			<TableRowActions show-edit @edit="emit('edit', toMainCategory(row))" @delete="emit('delete', toMainCategory(row))" />
		</template>
	</DataTable>
</template>
