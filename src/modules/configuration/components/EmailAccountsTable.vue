<script setup lang="ts">
	import Button from '@/shared/ui/Button.vue'
	import DataTable from '@/shared/ui/DataTable.vue'
	import StatusBadge from '@/shared/ui/StatusBadge.vue'

	import { EditIcon, TrashIcon } from '@/shared/icons'
	import { EMAIL_ACCOUNTS_TABLE_COLUMNS } from '../helpers'
	import type { EmailAccount } from '../types'

	defineProps<{
		items: EmailAccount[]
		loading: boolean
	}>()

	defineEmits<{
		(e: 'edit', item: EmailAccount): void
		(e: 'delete', item: EmailAccount): void
	}>()

	const toItem = (row: unknown) => row as EmailAccount
	const badgeClass = (value: boolean) => (value ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700')
</script>

<template>
	<DataTable :columns="EMAIL_ACCOUNTS_TABLE_COLUMNS" :rows="items" :loading="loading" empty-text="Пока нет email-аккаунтов.">
		<template #cell-email="{ row }">
			<span class="font-medium text-gray-800">{{ toItem(row).email }}</span>
		</template>

		<template #cell-display_name="{ row }">
			<span class="text-gray-700">{{ toItem(row).display_name }}</span>
		</template>

		<template #cell-host="{ row }">
			<span class="text-gray-700">{{ toItem(row).host }}</span>
		</template>

		<template #cell-port="{ row }">
			<span class="text-gray-700">{{ toItem(row).port }}</span>
		</template>

		<template #cell-ssl="{ row }">
			<StatusBadge :tone-class="badgeClass(toItem(row).ssl)">
				{{ toItem(row).ssl ? 'Да' : 'Нет' }}
			</StatusBadge>
		</template>

		<template #cell-is_default="{ row }">
			<StatusBadge :tone-class="badgeClass(toItem(row).is_default)">
				{{ toItem(row).is_default ? 'Да' : 'Нет' }}
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
					:on-click="() => $emit('edit', toItem(row))"
				>
					<EditIcon />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					class-name="hover:text-red-700"
					aria-label="Delete"
					:on-click="() => $emit('delete', toItem(row))"
				>
					<TrashIcon />
				</Button>
			</div>
		</template>
	</DataTable>
</template>

