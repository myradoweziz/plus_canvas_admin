<script setup lang="ts">
	import { defineAsyncComponent, onMounted, ref } from 'vue'
	import { toast } from 'vue3-toastify'

	import Banner from '@/shared/ui/Banner.vue'
	import Button from '@/shared/ui/Button.vue'
	import DeleteModal from '@/shared/ui/DeleteModal.vue'
	import Pagination from '@/shared/ui/Pagination.vue'
	import TextField from '@/shared/ui/TextField.vue'
	import StocksTable from '../components/StocksTable.vue'
	const StockCreateModal = defineAsyncComponent(() => import('../components/StockCreateModal.vue'))

	import { StocksIcon } from '@/shared/icons'
	import { api } from '../api'
	import type { Stock } from '../types'

	const loading = ref(false)
	const stocks = ref<Stock[]>([])
	const showStockModal = ref(false)
	const selectedStock = ref<Stock | null>(null)
	const showDeleteModal = ref(false)
	const loadingDeleteModal = ref(false)
	const total = ref(0)
	const limit = ref(10)
	const offset = ref(0)
	const filters = ref({
		search: ''
	})

	const load = async () => {
		loading.value = true
		try {
			const result = await api.listStocks({
				title: filters.value.search,
				limit: limit.value,
				offset: offset.value
			})
			stocks.value = result.items
			total.value = result.total
		} finally {
			loading.value = false
		}
	}

	onMounted(load)

	const openCreate = () => {
		selectedStock.value = null
		showStockModal.value = true
	}

	const closeStockModal = () => {
		showStockModal.value = false
		selectedStock.value = null
	}

	const editStock = (stock: Stock) => {
		selectedStock.value = stock
		showStockModal.value = true
	}

	const deleteStock = (stock: Stock) => {
		selectedStock.value = stock
		showDeleteModal.value = true
	}

	const confirmDelete = async () => {
		if (!selectedStock.value?.id) return

		loadingDeleteModal.value = true
		try {
			await api.deleteStock(selectedStock.value.id)
			showDeleteModal.value = false
			selectedStock.value = null
			await load()
		} finally {
			loadingDeleteModal.value = false
		}
	}

	const reorderStocks = async (orderedStocks: Stock[]) => {
		toast.info('Порядок изменён. Сохраняю...')
		try {
			stocks.value = orderedStocks
			await api.reorderStocks({
				items: orderedStocks
					.filter((stock): stock is Stock & { id: number } => stock.id !== null)
					.map((stock) => ({
						id: stock.id,
						order: stock.order
					}))
			})
			await load()
			toast.success('Порядок сохранён')
		} catch (e) {
			toast.error('Не удалось сохранить порядок')
			await load()
		}
	}

	const applyFilters = async () => {
		offset.value = 0
		await load()
	}

	const resetFilters = async () => {
		filters.value = {
			search: ''
		}
		limit.value = 10
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
		<Banner title="Акции" subtitle="Список акций и управление ими." :icon="StocksIcon" :total="total">
			<template #actions>
				<Button type="button" size="sm" :on-click="openCreate">Добавить акцию</Button>
			</template>
		</Banner>

		<form
			class="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-4 md:grid-cols-4"
			@submit.prevent="applyFilters"
		>
			<TextField v-model.trim="filters.search" label="Поиск" name="search" placeholder="Поиск" />

			<div class="flex items-end gap-2">
				<Button type="submit" size="sm">Фильтр</Button>
				<Button type="button" variant="outline" size="sm" :on-click="resetFilters">Сброс</Button>
			</div>
		</form>

		<StocksTable :stocks="stocks" :loading="loading" @edit="editStock" @delete="deleteStock" @reorder="reorderStocks" />

		<Pagination :total="total" :limit="limit" :offset="offset" @update:offset="changeOffset" />

		<StockCreateModal
			v-if="showStockModal"
			:open="showStockModal"
			:stock="selectedStock"
			@close="closeStockModal"
			@saved="load"
		/>

		<DeleteModal
			:open="showDeleteModal"
			:title="selectedStock?.title"
			entity-name="акцию"
			:loading="loadingDeleteModal"
			@close="showDeleteModal = false"
			@confirm="confirmDelete"
		/>
	</div>
</template>
