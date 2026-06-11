<script setup lang="ts">
	import DataTable from '@/shared/ui/DataTable.vue'
	import TableRowActions from '@/shared/ui/TableRowActions.vue'

	import { USER_ADDRESSES_TABLE_COLUMNS } from '../../helpers/user-addresses'
	import type { UserProfileAddress } from '../../types'

	defineProps<{
		addresses: UserProfileAddress[]
		loading: boolean
	}>()

	defineEmits<{
		(e: 'edit', address: UserProfileAddress): void
		(e: 'delete', address: UserProfileAddress): void
	}>()

	const toAddress = (row: unknown) => row as UserProfileAddress

	const fullName = (address: UserProfileAddress) =>
		[address.first_name, address.last_name].filter(Boolean).join(' ').trim() || '—'
</script>

<template>
	<DataTable
		:columns="USER_ADDRESSES_TABLE_COLUMNS"
		:rows="addresses"
		:loading="loading"
		empty-text="Адресов не найдено."
		:pagination="{ limit: addresses.length || 1, offset: 0 }"
		clickable
		@row-click="(row) => $emit('edit', toAddress(row))"
	>
		<template #cell-name="{ row }">
			<span class="font-medium text-gray-800">{{ fullName(toAddress(row)) }}</span>
		</template>

		<template #cell-email="{ row }">
			<span class="text-gray-700">{{ toAddress(row).email || '—' }}</span>
		</template>

		<template #cell-phone_number="{ row }">
			<span class="text-gray-700">{{ toAddress(row).phone_number || '—' }}</span>
		</template>

		<template #cell-address="{ row }">
			<span class="text-gray-700">{{ toAddress(row).address || '—' }}</span>
		</template>

		<template #cell-city="{ row }">
			<span class="text-gray-700">{{ toAddress(row).city || '—' }}</span>
		</template>

		<template #cell-is_default="{ row }">
			<span
				class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium"
				:class="toAddress(row).is_default ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'"
			>
				{{ toAddress(row).is_default ? 'Да' : 'Нет' }}
			</span>
		</template>

		<template #cell-actions="{ row }">
			<TableRowActions @delete="$emit('delete', toAddress(row))" />
		</template>
	</DataTable>
</template>
