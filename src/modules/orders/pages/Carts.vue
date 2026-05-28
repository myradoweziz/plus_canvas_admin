<script setup lang="ts">
	import { onMounted, ref } from 'vue'

	import Banner from '@/shared/ui/Banner.vue'
	import Pagination from '@/shared/ui/Pagination.vue'
	import CartsTable from '../components/CartsTable.vue'

	import { TableIcon } from '@/shared/icons'
	import { api } from '../api'
	import type { Cart } from '../types'

	const loading = ref(false)
	const carts = ref<Cart[]>([])
	const totalCount = ref(0)
	const limit = ref(15)
	const offset = ref(0)

	const load = async () => {
		loading.value = true
		try {
			const { data, total } = await api.getCarts({ limit: limit.value, offset: offset.value })

			carts.value = data
			totalCount.value = total
		} finally {
			loading.value = false
		}
	}

	onMounted(load)

	const changeOffset = async (value: number) => {
		offset.value = value
		await load()
	}
</script>

<template>
	<div class="space-y-6">
		<Banner title="Корзины" subtitle="Список корзин." :icon="TableIcon" :total="totalCount"> </Banner>

		<CartsTable :carts="carts" :loading="loading" :pagination="{ limit, offset }" />

		<Pagination :total="totalCount" :limit="limit" :offset="offset" @update:offset="changeOffset" />
	</div>
</template>
