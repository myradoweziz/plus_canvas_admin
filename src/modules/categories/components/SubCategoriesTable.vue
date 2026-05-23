<script setup lang="ts">
	import Button from '@/shared/ui/Button.vue'
	import DataTable from '@/shared/ui/DataTable.vue'

	import { EditIcon, TrashIcon } from '@/shared/icons'
	import { SUB_CATEGORIES_TABLE_COLUMNS } from '../helpers'
	import type { SubCategory } from '../types/category'

	defineProps<{
		categories: SubCategory[]
		loading: boolean
		selectedCategories?: SubCategory[]
	}>()

	const toSubCategory = (row: unknown) => row as SubCategory

	const emit = defineEmits<{
		(e: 'edit', subCategory: SubCategory): void
		(e: 'delete', subCategory: SubCategory): void
		(e: 'reorder', subCategories: SubCategory[]): void
		(e: 'update:selectedCategories', categories: SubCategory[]): void
	}>()

	const onReorder = (rows: unknown[]) => {
		emit('reorder', rows as SubCategory[])
	}

	const onUpdateSelected = (rows: unknown[]) => {
		emit('update:selectedCategories', rows as SubCategory[])
	}
</script>

<template>
	<DataTable
		:columns="SUB_CATEGORIES_TABLE_COLUMNS"
		:rows="categories"
		:loading="loading"
		empty-text="Пока нет категорий."
		draggable
		selectable
		:selected-rows="selectedCategories"
		order-key="featured_order"
		@update:selected-rows="onUpdateSelected"
		@reorder="onReorder"
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
			<span
				class="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold"
				:class="toSubCategory(row).is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'"
			>
				{{ toSubCategory(row).is_active ? 'Активно' : 'Не активно' }}
			</span>
		</template>

		<template #cell-featured_order="{ row }">
			<span class="text-gray-700">{{ toSubCategory(row).featured_order }}</span>
		</template>

		<template #cell-discount="{ row }">
			<span class="text-gray-700">{{ toSubCategory(row).discount ?? 0 }}</span>
		</template>

		<template #cell-actions="{ row }">
			<div class="flex items-center justify-end gap-2">
				<Button
					type="button"
					variant="ghost"
					size="icon"
					class-name="hover:bg-green-100"
					aria-label="Edit"
					:on-click="() => $emit('edit', toSubCategory(row))"
				>
					<EditIcon />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					class-name="hover:text-red-700"
					aria-label="Delete"
					:on-click="() => $emit('delete', toSubCategory(row))"
				>
					<TrashIcon />
				</Button>
			</div>
		</template>
	</DataTable>
</template>
