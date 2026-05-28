<script setup lang="ts">
	import { computed, onMounted, ref } from 'vue'

	import Banner from '@/shared/ui/Banner.vue'
	import Button from '@/shared/ui/Button.vue'
	import Pagination from '@/shared/ui/Pagination.vue'
	import SelectField from '@/shared/ui/SelectField.vue'
	import TextField from '@/shared/ui/TextField.vue'
	import BestsellersTable from '../components/BestsellersTable.vue'

	import { api as categoriesApi } from '@/modules/categories/api'
	import { TableIcon } from '@/shared/icons'
	import { api } from '../api'
	import { ORDER_STATUS_FILTER_OPTIONS, PAYMENT_STATUS_FILTER_OPTIONS } from '../helpers'
	import type { Bestseller } from '../types'

	const loading = ref(false)
	const bestsellers = ref<Bestseller[]>([])
	const totalCount = ref(0)
	const limit = ref(15)
	const offset = ref(0)

	// Featured categories for the category filter select
	const featuredCategories = ref<{ id: number | null; name: string }[]>([])

	const categoryOptions = computed(() => [
		{ label: 'Все', value: null as number | null },
		...featuredCategories.value.filter((c) => c.id !== null).map((c) => ({ label: c.name, value: c.id as number }))
	])

	const loadCategories = async () => {
		try {
			const { items } = await categoriesApi.listFeaturedCategories()
			featuredCategories.value = items
		} catch (error) {
			console.error(error)
		}
	}

	const filters = ref({
		date_from: '',
		date_to: '',
		order_status: null as string | null,
		payment_status: null as string | null,
		category_id: null as number | null,
		billing_country: ''
	})

	const load = async () => {
		loading.value = true
		try {
			const { data, total } = await api.getBestsellers({
				date_from: filters.value.date_from || undefined,
				date_to: filters.value.date_to || undefined,
				order_status: filters.value.order_status ?? undefined,
				payment_status: filters.value.payment_status ?? undefined,
				category_id: filters.value.category_id ?? undefined,
				billing_country: filters.value.billing_country || undefined,
				limit: limit.value,
				offset: offset.value
			})
			bestsellers.value = data
			totalCount.value = total
		} finally {
			loading.value = false
		}
	}

	onMounted(() => {
		loadCategories()
		load()
	})

	const applyFilters = async () => {
		offset.value = 0
		await load()
	}

	const resetFilters = async () => {
		filters.value = {
			date_from: '',
			date_to: '',
			order_status: null,
			payment_status: null,
			category_id: null,
			billing_country: ''
		}
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
		<Banner title="Бестселлеры" subtitle="Топ продаваемых товаров." :icon="TableIcon" :total="totalCount" />

		<form
			class="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-4 md:grid-cols-3 xl:grid-cols-4"
			@submit.prevent="applyFilters"
		>
			<TextField v-model="filters.date_from" label="Дата с" name="date_from" type="date" />
			<TextField v-model="filters.date_to" label="Дата по" name="date_to" type="date" />
			<SelectField
				v-model="filters.order_status"
				label="Статус заказа"
				name="order_status"
				placeholder="Все"
				:options="ORDER_STATUS_FILTER_OPTIONS"
			/>
			<SelectField
				v-model="filters.payment_status"
				label="Статус оплаты"
				name="payment_status"
				placeholder="Все"
				:options="PAYMENT_STATUS_FILTER_OPTIONS"
			/>
			<SelectField
				v-model="filters.category_id"
				label="Категория"
				name="category_id"
				placeholder="Все"
				:options="categoryOptions"
			/>
			<TextField v-model.trim="filters.billing_country" label="Страна" name="billing_country" placeholder="TR, RU..." />

			<div class="flex items-end gap-2 md:col-span-3 xl:col-span-4">
				<Button type="submit" size="sm">Фильтр</Button>
				<Button type="button" variant="outline" size="sm" :on-click="resetFilters">Сброс</Button>
			</div>
		</form>

		<BestsellersTable :bestsellers="bestsellers" :loading="loading" :pagination="{ limit, offset }" />

		<Pagination :total="totalCount" :limit="limit" :offset="offset" @update:offset="changeOffset" />
	</div>
</template>
