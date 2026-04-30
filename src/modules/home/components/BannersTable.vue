<template>
	<DataTable
		:columns="columns"
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
			<span
				class="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold"
				:class="toBanner(row).is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'"
			>
				{{ toBanner(row).is_active ? 'true' : 'false' }}
			</span>
		</template>

		<template #cell-actions="{ row }">
			<div class="flex items-center justify-end gap-2">
				<button
					type="button"
					class="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-green-100 hover:text-gray-900"
					aria-label="Edit"
					@click="$emit('edit', toBanner(row))"
				>
					<EditIcon />
				</button>
				<button
					type="button"
					class="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 hover:text-red-700"
					aria-label="Delete"
					@click="$emit('delete', toBanner(row))"
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

	import type { Banner } from '../types/banner'

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

	const columns = [
		{ key: 'title', label: 'Title' },
		{ key: 'image_url', label: 'Image URL' },
		{ key: 'url', label: 'URL' },
		{ key: 'order', label: 'Order' },
		{ key: 'is_active', label: 'Active' },
		{ key: 'actions', label: 'Actions', headerClass: 'text-right' }
	]

	const toBanner = (row: unknown) => row as Banner

	const onReorder = (rows: unknown[]) => {
		emit('reorder', rows as Banner[])
	}
</script>
