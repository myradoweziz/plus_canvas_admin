<script setup lang="ts">
	import DataTable from '@/shared/ui/DataTable.vue'
	import StatusBadge from '@/shared/ui/StatusBadge.vue'

	import { formatUserDate } from '@/modules/settings/helpers/users'
	import {
		ACTIVITY_LOG_TABLE_COLUMNS,
		formatActivityChanges,
		formatActivityLogCauser,
		formatActivitySubject
	} from '../../helpers'
	import type { ActivityLog } from '../../types'

	defineProps<{
		items: ActivityLog[]
		loading: boolean
	}>()

	const toLog = (row: unknown) => row as ActivityLog
</script>

<template>
	<DataTable
		:columns="ACTIVITY_LOG_TABLE_COLUMNS"
		:rows="items"
		:loading="loading"
		empty-text="Записи лога не найдены."
		:pagination="{ limit: items.length || 1, offset: 0 }"
	>
		<template #cell-created_at="{ row }">
			<span class="text-gray-700">{{ formatUserDate(toLog(row).created_at) }}</span>
		</template>

		<template #cell-event="{ row }">
			<StatusBadge tone-class="bg-blue-100 text-blue-800" class="capitalize">
				{{ toLog(row).event || '—' }}
			</StatusBadge>
		</template>

		<template #cell-description="{ row }">
			<span class="text-gray-700 capitalize">{{ toLog(row).description || '—' }}</span>
		</template>

		<template #cell-log_name="{ row }">
			<span class="text-gray-700">{{ toLog(row).log_name || '—' }}</span>
		</template>

		<template #cell-subject="{ row }">
			<span class="text-gray-700">{{ formatActivitySubject(toLog(row)) }}</span>
		</template>

		<template #cell-causer="{ row }">
			<span class="text-gray-700">{{ formatActivityLogCauser(toLog(row)) }}</span>
		</template>

		<template #cell-changes="{ row }">
			<span class="text-sm text-gray-700">{{ formatActivityChanges(toLog(row).attribute_changes) }}</span>
		</template>
	</DataTable>
</template>
