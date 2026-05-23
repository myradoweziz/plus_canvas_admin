<script setup lang="ts">
	import { computed, ref } from 'vue'

	type DataTableRow = Record<string, any>

	type DataTableColumn = {
		key: string
		label: string
		headerClass?: string
		cellClass?: string
	}

	const props = withDefaults(
		defineProps<{
			columns: DataTableColumn[]
			rows: unknown[]
			loading?: boolean
			loadingText?: string
			emptyText?: string
			rowKey?: string
			rowClass?: string
			draggable?: boolean
			orderKey?: string
			selectable?: boolean
			selectedRows?: unknown[]
		}>(),
		{
			loading: false,
			loadingText: 'Загрузка...',
			emptyText: 'Пока нет данных.',
			rowKey: 'id',
			rowClass: '',
			draggable: false,
			orderKey: '',
			selectable: false,
			selectedRows: () => []
		}
	)

	const emit = defineEmits<{
		(e: 'reorder', rows: unknown[]): void
		(e: 'update:selectedRows', rows: unknown[]): void
	}>()

	const dragIndex = ref<number | null>(null)

	const colSpan = computed(() => props.columns.length + (props.draggable ? 1 : 0) + (props.selectable ? 1 : 0))

	const getTableRow = (row: unknown) => row as DataTableRow

	const getCellValue = (row: unknown, key: string) => getTableRow(row)[key] ?? ''

	const getRowKey = (row: unknown, index: number) => getTableRow(row)[props.rowKey] ?? index

	const isSelected = (row: unknown, index: number) => {
		return props.selectedRows.some((r) => getRowKey(r, index) === getRowKey(row, index))
	}

	const toggleSelection = (row: unknown, index: number) => {
		const current = [...props.selectedRows]
		const idx = current.findIndex((r) => getRowKey(r, index) === getRowKey(row, index))
		if (idx > -1) {
			current.splice(idx, 1)
		} else {
			current.push(row)
		}
		emit('update:selectedRows', current)
	}

	const isAllSelected = computed(() => {
		return props.rows.length > 0 && props.rows.length === props.selectedRows.length
	})

	const toggleAll = () => {
		if (isAllSelected.value) {
			emit('update:selectedRows', [])
		} else {
			emit('update:selectedRows', [...props.rows])
		}
	}

	const onDragStart = (index: number) => {
		if (!props.draggable) return

		dragIndex.value = index
	}

	const onDrop = (dropIndex: number) => {
		if (!props.draggable || dragIndex.value === null || dragIndex.value === dropIndex) {
			onDragEnd()
			return
		}

		const reordered = [...props.rows]
		const [moved] = reordered.splice(dragIndex.value, 1)
		reordered.splice(dropIndex, 0, moved)

		emit(
			'reorder',
			reordered.map((row, index) => ({
				...getTableRow(row),
				...(props.orderKey ? { [props.orderKey]: index + 1 } : {})
			}))
		)

		onDragEnd()
	}

	const onDragEnd = () => {
		dragIndex.value = null
	}
</script>

<template>
	<section class="rounded-2xl border border-gray-200 bg-white">
		<div class="overflow-x-auto">
			<table class="min-w-full text-left text-sm">
				<thead class="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
					<tr>
						<th v-if="selectable" class="w-12 px-4 py-3">
							<input
								type="checkbox"
								class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
								:checked="isAllSelected"
								@change="toggleAll"
							/>
						</th>
						<th v-if="draggable" class="w-12 px-4 py-3"></th>
						<th v-for="column in columns" :key="column.key" class="px-4 py-3" :class="column.headerClass">
							{{ column.label }}
						</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200">
					<tr v-if="loading">
						<td class="px-4 py-4 text-gray-600" :colspan="colSpan">{{ loadingText }}</td>
					</tr>
					<tr v-else-if="!rows.length">
						<td class="px-4 py-4 text-gray-600" :colspan="colSpan">{{ emptyText }}</td>
					</tr>
					<tr
						v-else
						v-for="(row, index) in rows"
						:key="getRowKey(row, index)"
						:draggable="draggable"
						class="hover:bg-gray-50"
						:class="[rowClass, { 'cursor-grab': draggable, 'opacity-50': dragIndex === index }]"
						@dragstart="onDragStart(index)"
						@dragover.prevent
						@drop="onDrop(index)"
						@dragend="onDragEnd"
					>
						<td v-if="selectable" class="px-4 py-3">
							<input
								type="checkbox"
								class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
								:checked="isSelected(row, index)"
								@change="toggleSelection(row, index)"
							/>
						</td>
						<td v-if="draggable" class="px-4 py-3 text-gray-400">
							<span class="select-none text-lg leading-none" title="Drag to reorder">⋮⋮</span>
						</td>
						<td v-for="column in columns" :key="column.key" class="px-4 py-3" :class="column.cellClass">
							<slot :name="`cell-${column.key}`" :row="row" :value="getCellValue(row, column.key)" :index="index">
								{{ getCellValue(row, column.key) }}
							</slot>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</section>
</template>
