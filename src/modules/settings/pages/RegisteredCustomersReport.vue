<script setup lang="ts">
	import { onMounted, ref } from 'vue'

	import Banner from '@/shared/ui/Banner.vue'
	import { UserCircleIcon } from '@/shared/icons'
	import { api } from '../api'
	import { REGISTERED_CUSTOMERS_STAT_ITEMS } from '../helpers/registered-customers-report'
	import type { RegisteredCustomersReport } from '../types'

	const loading = ref(false)
	const stats = ref<RegisteredCustomersReport | null>(null)

	const load = async () => {
		loading.value = true
		try {
			stats.value = await api.getRegisteredCustomersReport()
		} finally {
			loading.value = false
		}
	}

	onMounted(load)
</script>

<template>
	<div class="space-y-6">
		<Banner
			title="Зарегистрированные клиенты"
			subtitle="Количество новых регистраций за период."
			:icon="UserCircleIcon"
			:total="stats?.total ?? undefined"
		/>

		<p v-if="loading" class="text-sm text-gray-600">Загрузка...</p>

		<div v-else-if="stats" class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
			<div
				v-for="item in REGISTERED_CUSTOMERS_STAT_ITEMS"
				:key="item.key"
				class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
			>
				<p class="text-sm font-medium text-gray-600">{{ item.label }}</p>
				<p class="mt-2 text-3xl font-semibold text-gray-900">{{ stats[item.key] }}</p>
			</div>
		</div>

		<p v-else class="text-sm text-gray-600">Нет данных.</p>
	</div>
</template>
