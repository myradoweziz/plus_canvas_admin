<script setup lang="ts">
	import { onMounted, ref } from 'vue'

	import Banner from '@/shared/ui/Banner.vue'
	import Pagination from '@/shared/ui/Pagination.vue'
	import WishlistTable from '../components/WishlistTable.vue'

	import { TableIcon } from '@/shared/icons'
	import { api } from '../api/index.ts'
	import type { Wishlist } from '../types/index.ts'

	const loading = ref(false)
	const wishlists = ref<Wishlist[]>([])
	const totalCount = ref(0)
	const limit = ref(15)
	const offset = ref(0)

	const load = async () => {
		loading.value = true
		try {
			const { data, total } = await api.getWishlists({ limit: limit.value, offset: offset.value })

			wishlists.value = data
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
		<Banner title="Избранное" subtitle="Список избранного." :icon="TableIcon" :total="totalCount"> </Banner>

		<WishlistTable :wishlists="wishlists" :loading="loading" :pagination="{ limit, offset }" />

		<Pagination :total="totalCount" :limit="limit" :offset="offset" @update:offset="changeOffset" />
	</div>
</template>
