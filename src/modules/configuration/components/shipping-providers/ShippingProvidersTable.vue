<script setup lang="ts">
	import Button from '@/shared/ui/Button.vue'
	import DataTable from '@/shared/ui/DataTable.vue'
	import StatusBadge from '@/shared/ui/StatusBadge.vue'

	import { EditIcon, TrashIcon } from '@/shared/icons'
	import { SHIPPING_PROVIDERS_TABLE_COLUMNS } from '../helpers'
	import type { ShippingProvider } from '../types'

	defineProps<{
		items: ShippingProvider[]
		loading: boolean
	}>()

	defineEmits<{
		(e: 'edit', item: ShippingProvider): void
		(e: 'delete', item: ShippingProvider): void
	}>()

	const toItem = (row: unknown) => row as ShippingProvider
	const badgeClass = (value: boolean) => (value ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700')
</script>

<template>
	<DataTable
		:columns="SHIPPING_PROVIDERS_TABLE_COLUMNS"
		:rows="items"
		:loading="loading"
		empty-text="Пока нет провайдеров доставки."
	>
		<template #cell-logo_path="{ row }">
			<img
				v-if="toItem(row).logo_path"
				:src="toItem(row).logo_path"
				:alt="toItem(row).friendly_name"
				class="h-10 w-16 rounded object-contain ring-1 ring-gray-200"
			/>
			<span v-else class="text-sm text-gray-400">—</span>
		</template>

		<template #cell-friendly_name="{ row }">
			<span class="font-medium text-gray-800">{{ toItem(row).friendly_name }}</span>
		</template>

		<template #cell-system_name="{ row }">
			<span class="text-gray-700">{{ toItem(row).system_name }}</span>
		</template>

		<template #cell-display_order="{ row }">
			<span class="text-gray-700">{{ toItem(row).display_order }}</span>
		</template>

		<template #cell-is_active="{ row }">
			<StatusBadge :tone-class="badgeClass(toItem(row).is_active)">
				{{ toItem(row).is_active ? 'Да' : 'Нет' }}
			</StatusBadge>
		</template>

		<template #cell-actions="{ row }">
			<div class="flex items-center justify-end gap-2">
				<Button
					type="button"
					variant="ghost"
					size="icon"
					class-name="hover:bg-green-100"
					aria-label="Редактировать"
					:on-click="() => $emit('edit', toItem(row))"
				>
					<EditIcon />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					class-name="hover:text-red-700"
					aria-label="Удалить"
					:on-click="() => $emit('delete', toItem(row))"
				>
					<TrashIcon />
				</Button>
			</div>
		</template>
	</DataTable>
</template>
