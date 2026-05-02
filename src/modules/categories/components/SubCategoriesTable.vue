<template>
	<DataTable
		:columns="columns"
		:rows="categories"
		:loading="loading"
		empty-text="Пока нет категорий."
		draggable
		order-key="featured_order"
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

		<template #cell-is_active="{ row }">
			<span
				class="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold"
				:class="toSubCategory(row).is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'"
			>
				{{ toSubCategory(row).is_active ? 'true' : 'false' }}
			</span>
		</template>

		<template #cell-featured_order="{ row }">
			<span class="text-gray-700">{{ toSubCategory(row).featured_order }}</span>
		</template>

		<template #cell-actions="{ row }">
			<div class="flex items-center justify-end gap-2">
				<button
					type="button"
					class="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-green-100 hover:text-gray-900"
					aria-label="Edit"
					@click="$emit('edit', toSubCategory(row))"
				>
					<EditIcon />
				</button>
				<button
					type="button"
					class="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 hover:text-red-700"
					aria-label="Delete"
					@click="$emit('delete', toSubCategory(row))"
				>
					<TrashIcon />
				</button>
			</div>
		</template>
	</DataTable>
</template>

<script setup lang="ts">
	import { EditIcon, TrashIcon } from '@/shared/icons'
	import DataTable from '@/shared/ui/DataTable.vue'
	import type { SubCategory } from '../types/category'

	defineProps<{
		categories: SubCategory[]
		loading: boolean
	}>()

	const columns = [
		{ key: 'name', label: 'Name' },
		{ key: 'category_name', label: 'Category' },
		{ key: 'slug', label: 'Slug' },
		{ key: 'is_active', label: 'Active' },
		{ key: 'featured_order', label: 'Featured Order' },
		{ key: 'actions', label: 'Actions', headerClass: 'text-right' }
	]

	const toSubCategory = (row: unknown) => row as SubCategory

	const emit = defineEmits<{
		(e: 'edit', subCategory: SubCategory): void
		(e: 'delete', subCategory: SubCategory): void
		(e: 'reorder', subCategories: SubCategory[]): void
	}>()

	const onReorder = (rows: unknown[]) => {
		emit('reorder', rows as SubCategory[])
	}
</script>
