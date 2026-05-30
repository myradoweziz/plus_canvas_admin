<script setup lang="ts">
	import { onMounted, ref, watch } from 'vue'
	import { toast } from 'vue3-toastify'

	import UserActivityLogsTable from './UserActivityLogsTable.vue'

	import { api } from '../../api'
	import type { UserActivityLog } from '../../types'

	const props = defineProps<{ userId: number }>()

	const loading = ref(false)
	const logs = ref<UserActivityLog[]>([])

	const loadActivityLogs = async () => {
		loading.value = true
		try {
			logs.value = await api.getUserActivityLogs(props.userId)
		} catch {
			logs.value = []
			toast.error('Не удалось загрузить activity logs')
		} finally {
			loading.value = false
		}
	}

	onMounted(loadActivityLogs)

	watch(
		() => props.userId,
		() => loadActivityLogs()
	)
</script>

<template>
	<UserActivityLogsTable :logs="logs" :loading="loading" />
</template>
