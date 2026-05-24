<script setup lang="ts">
	import Button from '@/shared/ui/Button.vue'
	import DataTable from '@/shared/ui/DataTable.vue'
	import StatusBadge from '@/shared/ui/StatusBadge.vue'

	import { EditIcon, TrashIcon } from '@/shared/icons'
	import { FEATURED_CATEGORIES_TABLE_COLUMNS } from '../helpers'
	import type { FeaturedCategory } from '../types'

	defineProps<{
		categories: FeaturedCategory[]
		loading: boolean
	}>()

	const toFeaturedCategory = (row: unknown) => row as FeaturedCategory

	const emit = defineEmits<{
		(e: 'edit', featuredCategory: FeaturedCategory): void
		(e: 'delete', featuredCategory: FeaturedCategory): void
		(e: 'reorder', featuredCategories: FeaturedCategory[]): void
	}>()

	const onReorder = (rows: unknown[]) => {
		emit('reorder', rows as FeaturedCategory[])
	}
</script>

<template>
	<DataTable
		:columns="FEATURED_CATEGORIES_TABLE_COLUMNS"
		:rows="categories"
		:loading="loading"
		empty-text="Пока нет категорий."
		draggable
		order-key="featured_order"
		@reorder="onReorder"
	>
		<template #cell-name="{ row }">
			<span class="font-medium text-gray-800">{{ toFeaturedCategory(row).name }}</span>
		</template>
		<template #cell-main_category="{ row }">
			<span class="font-medium text-gray-800">{{ toFeaturedCategory(row).main_category?.name }}</span>
		</template>

		<template #cell-slug="{ row }">
			<span class="text-gray-700">{{ toFeaturedCategory(row).slug }}</span>
		</template>

		<template #cell-category_type="{ row }">
			<span class="text-gray-700">{{ toFeaturedCategory(row).category_type }}</span>
		</template>

		<template #cell-image_url="{ row }">
			<img
				v-if="toFeaturedCategory(row).image_url"
				:src="toFeaturedCategory(row).image_url"
				:alt="toFeaturedCategory(row).name"
				class="h-16 w-24 rounded-lg object-cover ring-1 ring-gray-200"
			/>
		</template>

		<template #cell-is_active="{ row }">
			<StatusBadge :tone-class="toFeaturedCategory(row).is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'">
				{{ toFeaturedCategory(row).is_active ? 'Активно' : 'Не активно' }}
			</StatusBadge>
		</template>

		<template #cell-featured_order="{ row }">
			<span class="text-gray-700">{{ toFeaturedCategory(row).featured_order }}</span>
		</template>

		<template #cell-discount="{ row }">
			<span class="text-gray-700">{{ toFeaturedCategory(row).discount ?? 0 }}</span>
		</template>

		<template #cell-actions="{ row }">
			<div class="flex items-center justify-end gap-2">
				<Button
					type="button"
					variant="ghost"
					size="icon"
					class-name="hover:bg-green-100"
					aria-label="Edit"
					:on-click="() => $emit('edit', toFeaturedCategory(row))"
				>
					<EditIcon />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					class-name="hover:text-red-700"
					aria-label="Delete"
					:on-click="() => $emit('delete', toFeaturedCategory(row))"
				>
					<TrashIcon />
				</Button>
			</div>
		</template>
	</DataTable>
</template>
