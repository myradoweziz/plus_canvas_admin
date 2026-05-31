<script setup lang="ts">
	import { useRouter } from 'vue-router'

	import Button from '@/shared/ui/Button.vue'
	import DataTable from '@/shared/ui/DataTable.vue'
	import StatusBadge from '@/shared/ui/StatusBadge.vue'

	import { Eye } from '@/shared/icons'
	import { formatUserDate, userDisplayName } from '../helpers/users'
	import { ONLINE_CUSTOMERS_TABLE_COLUMNS } from '../helpers/online-customers'
	import type { OnlineCustomer } from '../types'

	defineProps<{
		rows: OnlineCustomer[]
		loading: boolean
	}>()

	const router = useRouter()

	const toRow = (row: unknown) => row as OnlineCustomer

	const openUser = (customer: OnlineCustomer) => {
		router.push(`/admin-panel/settings/users/${customer.id}/edit`)
	}
</script>

<template>
	<DataTable
		:columns="ONLINE_CUSTOMERS_TABLE_COLUMNS"
		:rows="rows"
		:loading="loading"
		empty-text="Нет онлайн-клиентов."
		:pagination="{ limit: rows.length || 1, offset: 0 }"
	>
		<template #cell-email="{ row }">
			<span class="text-gray-700">{{ toRow(row).email || '—' }}</span>
		</template>

		<template #cell-name="{ row }">
			<span class="font-medium text-gray-800">{{
				userDisplayName({
					name: toRow(row).name,
					first_name: toRow(row).first_name ?? undefined,
					last_name: toRow(row).last_name ?? undefined
				})
			}}</span>
		</template>

		<template #cell-phone_number="{ row }">
			<span class="text-gray-700">{{ toRow(row).phone_number || '—' }}</span>
		</template>

		<template #cell-is_active="{ row }">
			<StatusBadge :tone-class="toRow(row).is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
				{{ toRow(row).is_active ? 'Активен' : 'Неактивен' }}
			</StatusBadge>
		</template>

		<template #cell-last_activity_at="{ row }">
			<span class="text-gray-700">{{ formatUserDate(toRow(row).last_activity_at ?? undefined) }}</span>
		</template>

		<template #cell-ip_address="{ row }">
			<span class="text-gray-700">{{ toRow(row).ip_address || '—' }}</span>
		</template>

		<template #cell-actions="{ row }">
			<div class="flex items-center justify-end">
				<Button
					type="button"
					variant="ghost"
					size="icon"
					class-name="hover:bg-blue-100"
					aria-label="Открыть пользователя"
					:on-click="() => openUser(toRow(row))"
				>
					<Eye />
				</Button>
			</div>
		</template>
	</DataTable>
</template>
