<script setup lang="ts">
	import DataTable from '@/shared/ui/DataTable.vue'
	import StatusBadge from '@/shared/ui/StatusBadge.vue'

	import { formatUserDate } from '../../helpers/users'
	import {
		formatActivityCauser,
		formatActivityChanges,
		formatActivitySubject,
		USER_ACTIVITY_LOGS_TABLE_COLUMNS
	} from '../../helpers/user-activity-logs'
	import type { UserActivityLog } from '../../types'

	defineProps<{
		logs: UserActivityLog[]
		loading: boolean
	}>()

	const toLog = (row: unknown) => row as UserActivityLog
</script>

<template>
	<DataTable
		:columns="USER_ACTIVITY_LOGS_TABLE_COLUMNS"
		:rows="logs"
		:loading="loading"
		empty-text="Activity logs не найдены."
		:pagination="{ limit: logs.length || 1, offset: 0 }"
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
			<span class="text-gray-700">{{ formatActivityCauser(toLog(row)) }}</span>
		</template>

		<template #cell-changes="{ row }">
			<span class="text-sm text-gray-700">{{ formatActivityChanges(toLog(row).attribute_changes) }}</span>
		</template>
	</DataTable>
</template>
