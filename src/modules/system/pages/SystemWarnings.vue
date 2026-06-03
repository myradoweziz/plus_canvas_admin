<script setup lang="ts">
	import { onMounted, ref } from 'vue'
	import { toast } from 'vue3-toastify'

	import Banner from '@/shared/ui/Banner.vue'
	import Button from '@/shared/ui/Button.vue'
	import SystemWarningsList from '../components/system-warnings/SystemWarningsList.vue'

	import { getFirstBackendValidationMessage } from '@/shared/api/validation'
	import { SystemWarningsIcon } from '@/shared/icons'
	import { api } from '../api'
	import type { SystemWarning } from '../types'

	const loading = ref(false)
	const items = ref<SystemWarning[]>([])
	const totalCount = ref(0)

	const load = async () => {
		loading.value = true
		try {
			const result = await api.getSystemWarnings()
			items.value = result.warnings
			totalCount.value = result.total_count
		} catch (err) {
			items.value = []
			totalCount.value = 0
			const msg = getFirstBackendValidationMessage(err)
			if (msg) toast.error(msg)
			else toast.error('Не удалось загрузить системные уведомления')
		} finally {
			loading.value = false
		}
	}

	onMounted(load)
</script>

<template>
	<div class="space-y-6">
		<Banner
			title="Системные уведомления"
			subtitle="Актуальные предупреждения и статусы системы."
			:icon="SystemWarningsIcon"
			:total="totalCount"
		>
			<template #actions>
				<Button type="button" size="sm" :disabled="loading" :on-click="load">Обновить</Button>
			</template>
		</Banner>

		<SystemWarningsList :items="items" :loading="loading" />
	</div>
</template>
