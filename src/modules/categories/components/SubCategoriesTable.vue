<script setup lang="ts">
	import DataTable from '@/shared/ui/DataTable.vue'
	import StatusBadge from '@/shared/ui/StatusBadge.vue'

	import TableRowActions from '@/shared/ui/TableRowActions.vue'
	import { SUB_CATEGORIES_TABLE_COLUMNS } from '../helpers'
	import type { SubCategory } from '../types'

	defineProps<{
		categories: SubCategory[]
		loading: boolean
		pagination: { limit: number; offset: number }
		selectedCategories?: SubCategory[]
	}>()

	const toSubCategory = (row: unknown) => row as SubCategory

	const emit = defineEmits<{
		(e: 'edit', subCategory: SubCategory): void
		(e: 'delete', subCategory: SubCategory): void
		(e: 'reorder', subCategories: SubCategory[]): void
		(e: 'update:selectedCategories', categories: SubCategory[]): void
	}>()

	const onUpdateSelected = (rows: unknown[]) => {
		emit('update:selectedCategories', rows as SubCategory[])
	}

	const onReorder = (rows: unknown[]) => {
		emit('reorder', rows as SubCategory[])
	}
</script>

<template>
	<DataTable
		:columns="SUB_CATEGORIES_TABLE_COLUMNS"
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
			<span class="font-medium text-gray-800">{{ toSubCategory(row).name }}</span>
		</template>

		<template #cell-category_name="{ row }">
			<span class="font-medium text-gray-800">{{ toSubCategory(row).category?.name }}</span>
		</template>

		<template #cell-slug="{ row }">
			<span class="text-gray-700">{{ toSubCategory(row).slug }}</span>
		</template>

		<template #cell-image_url="{ row }">
			<img
				v-if="toSubCategory(row).image_url"
				:src="toSubCategory(row).image_url"
				:alt="toSubCategory(row).name"
				class="h-16 w-24 rounded-lg object-cover ring-1 ring-gray-200"
			/>
		</template>

		<template #cell-is_active="{ row }">
			<StatusBadge
				:tone-class="toSubCategory(row).is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'"
			>
				{{ toSubCategory(row).is_active ? 'Активно' : 'Не активно' }}
			</StatusBadge>
		</template>

		<template #cell-featured_order="{ row }">
			<span class="text-gray-700">{{ toSubCategory(row).featured_order }}</span>
		</template>

		<template #cell-discount="{ row }">
			<span class="text-gray-700">{{ toSubCategory(row).discount ?? 0 }}</span>
		</template>

		<template #cell-actions="{ row }">
			<TableRowActions show-edit @edit="emit('edit', toSubCategory(row))" @delete="emit('delete', toSubCategory(row))" />
		</template>
	</DataTable>
</template>
