<script setup lang="ts">
	import Button from '@/shared/ui/Button.vue'
	import DataTable from '@/shared/ui/DataTable.vue'
	import StatusBadge from '@/shared/ui/StatusBadge.vue'

	import { EditIcon, TrashIcon } from '@/shared/icons'
	import { CANVAS_FRAMES_TABLE_COLUMNS } from '../helpers'
	import type { CanvasFrame } from '../types'

	defineProps<{
		frames: CanvasFrame[]
		loading: boolean
	}>()

	const emit = defineEmits<{
		(e: 'edit', frame: CanvasFrame): void
		(e: 'delete', frame: CanvasFrame): void
	}>()

	const toFrame = (row: unknown) => row as CanvasFrame
</script>

<template>
	<DataTable :columns="CANVAS_FRAMES_TABLE_COLUMNS" :rows="frames" :loading="loading" empty-text="Пока нет рамок.">
		<template #cell-name="{ row }">
			<span class="font-medium text-gray-800">{{ toFrame(row).name }}</span>
		</template>

		<template #cell-hex_code="{ row }">
			<div class="flex items-center gap-2">
				<span
					class="h-6 w-6 rounded-full border border-gray-200"
					:style="{ backgroundColor: toFrame(row).color_hex }"
				></span>
				<span class="font-medium text-gray-700">{{ toFrame(row).color_hex }}</span>
			</div>
		</template>

		<template #cell-image_url="{ row }">
			<img
				v-if="toFrame(row).image_url"
				:src="toFrame(row).image_url"
				:alt="toFrame(row).name"
				class="h-16 w-24 rounded-lg object-cover ring-1 ring-gray-200"
			/>
			<span v-else class="text-sm text-gray-400">—</span>
		</template>

		<template #cell-price="{ row }">
			<span class="font-medium text-gray-700">{{ toFrame(row).price }}</span>
		</template>

		<template #cell-sort_order="{ row }">
			<span class="text-gray-700">{{ toFrame(row).sort_order }}</span>
		</template>

		<template #cell-is_active="{ row }">
			<StatusBadge :tone-class="toFrame(row).is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'">
				{{ toFrame(row).is_active ? 'Активно' : 'Не активно' }}
			</StatusBadge>
		</template>

		<template #cell-actions="{ row }">
			<div class="flex items-center justify-end gap-2">
				<Button
					type="button"
					variant="ghost"
					size="icon"
					class-name="hover:bg-green-100"
					aria-label="Edit"
					:on-click="() => $emit('edit', toFrame(row))"
				>
					<EditIcon />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					class-name="hover:text-red-700"
					aria-label="Delete"
					:on-click="() => $emit('delete', toFrame(row))"
				>
					<TrashIcon />
				</Button>
			</div>
		</template>
	</DataTable>
</template>
