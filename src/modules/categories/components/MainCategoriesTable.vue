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
				<button
					type="button"
					class="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-green-100 hover:text-gray-900"
					aria-label="Edit"
					@click="$emit('edit', toMainCategory(row))"
				>
					<EditIcon />
				</button>
				<button
					type="button"
					class="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 hover:text-red-700"
					aria-label="Delete"
					@click="$emit('delete', toMainCategory(row))"
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
	import type { MainCategory } from '../types/category'

	defineProps<{
		categories: MainCategory[]
		loading: boolean
	}>()

	const columns = [
		{ key: 'name', label: 'Name' },
		{ key: 'slug', label: 'Slug' },
		{ key: 'is_active', label: 'Active' },
		{ key: 'featured_order', label: 'Featured Order' },
		{ key: 'actions', label: 'Actions', headerClass: 'text-right' }
	]

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
