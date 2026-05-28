<script setup lang="ts">
	import { onMounted, ref } from 'vue'

	import Banner from '@/shared/ui/Banner.vue'
	import Button from '@/shared/ui/Button.vue'
	import Pagination from '@/shared/ui/Pagination.vue'
	import TextField from '@/shared/ui/TextField.vue'
	import NeverPurchasedTable from '../components/NeverPurchasedTable.vue'

	import { TableIcon } from '@/shared/icons'
	import { api } from '../api'
	import type { NeverPurchasedProduct } from '../types'

	const loading = ref(false)
	const products = ref<NeverPurchasedProduct[]>([])
	const totalCount = ref(0)
	const limit = ref(15)
	const offset = ref(0)

	const filters = ref({
		date_from: '',
		date_to: ''
	})

	const load = async () => {
		loading.value = true
		try {
			const { data, total } = await api.getNeverPurchased({
				date_from: filters.value.date_from || undefined,
				date_to: filters.value.date_to || undefined,
				limit: limit.value,
				offset: offset.value
			})
			products.value = data
			totalCount.value = total
		} finally {
			loading.value = false
		}
	}

	onMounted(load)

	const applyFilters = async () => {
		offset.value = 0
		await load()
	}

	const resetFilters = async () => {
		filters.value = { date_from: '', date_to: '' }
		limit.value = 15
		offset.value = 0
		await load()
	}

	const changeOffset = async (value: number) => {
		offset.value = value
		await load()
	}
</script>

<template>
	<div class="space-y-6">
		<Banner
			title="Не купленные товары"
			subtitle="Товары, которые ни разу не были куплены."
			:icon="TableIcon"
			:total="totalCount"
		/>

		<form
			class="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-4 md:grid-cols-3 xl:grid-cols-4"
			@submit.prevent="applyFilters"
		>
			<TextField v-model="filters.date_from" label="Дата с" name="date_from" type="date" />
			<TextField v-model="filters.date_to" label="Дата по" name="date_to" type="date" />

			<div class="flex items-end gap-2 md:col-span-3 xl:col-span-4">
				<Button type="submit" size="sm">Фильтр</Button>
				<Button type="button" variant="outline" size="sm" :on-click="resetFilters">Сброс</Button>
			</div>
		</form>

		<NeverPurchasedTable :products="products" :loading="loading" :pagination="{ limit, offset }" />

		<Pagination :total="totalCount" :limit="limit" :offset="offset" @update:offset="changeOffset" />
	</div>
</template>
