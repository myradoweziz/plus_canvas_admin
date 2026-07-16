<script setup lang="ts">
	import DataTable from '@/shared/ui/DataTable.vue'
	import TableRowActions from '@/shared/ui/TableRowActions.vue'
	import StatusBadge from '@/shared/ui/StatusBadge.vue'

	import { CANVAS_FRAMES_TABLE_COLUMNS } from '../helpers'
	import type { CanvasFrame } from '../types'

	defineProps<{
		frames: CanvasFrame[]
		loading: boolean
		pagination: { limit: number; offset: number }
	}>()

	const emit = defineEmits<{
		(e: 'edit', frame: CanvasFrame): void
		(e: 'delete', frame: CanvasFrame): void
	}>()

	const toFrame = (row: unknown) => row as CanvasFrame

	const apiBase = String(import.meta.env.VITE_APP_BASE_URL ?? '').replace(/\/+$/, '')

	const frameThumbSrc = (frame: CanvasFrame) => {
		const raw = String(frame.image_url ?? frame.image ?? '').trim()
		if (!raw) return ''
		if (raw.startsWith('http') || raw.startsWith('blob:') || raw.startsWith('data:')) return raw
		if (raw.startsWith('/')) return `${apiBase}${raw}`
		return `${apiBase}/storage/${raw.replace(/^\/+/, '')}`
	}
</script>

<template>
	<DataTable
		:columns="CANVAS_FRAMES_TABLE_COLUMNS"
		:rows="frames"
		:loading="loading"
		empty-text="Пока нет рамок."
		:pagination="pagination"
		clickable
		@row-click="(row) => emit('edit', toFrame(row))"
	>
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
			<div
				v-if="frameThumbSrc(toFrame(row))"
				class="flex h-16 w-24 items-center justify-center rounded-lg bg-gray-100 ring-1 ring-gray-200 p-1"
			>
				<img
					:src="frameThumbSrc(toFrame(row))"
					:alt="toFrame(row).name"
					class="max-h-full max-w-full object-contain"
				/>
			</div>
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
				{{ toFrame(row).is_active ? 'Опубликован' : 'Не опубликован' }}
			</StatusBadge>
		</template>

		<template #cell-actions="{ row }">
			<TableRowActions @delete="emit('delete', toFrame(row))" />
		</template>
	</DataTable>
</template>
