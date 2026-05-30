<script setup lang="ts">
	import { onMounted, ref } from 'vue'

	import Banner from '@/shared/ui/Banner.vue'
	import OnlineCustomersTable from '../components/OnlineCustomersTable.vue'

	import { UserActivityIcon } from '@/shared/icons'
	import { api } from '../api'
	import type { OnlineCustomer } from '../types'

	const loading = ref(false)
	const rows = ref<OnlineCustomer[]>([])

	const load = async () => {
		loading.value = true
		try {
			rows.value = await api.listOnlineCustomers()
		} finally {
			loading.value = false
		}
	}

	onMounted(load)
</script>

<template>
	<div class="space-y-6">
		<Banner
			title="Онлайн-клиенты"
			subtitle="Пользователи, которые сейчас онлайн."
			:icon="UserActivityIcon"
			:total="rows.length"
		/>

		<OnlineCustomersTable :rows="rows" :loading="loading" />
	</div>
</template>
