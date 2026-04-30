<script setup lang="ts">
	import { onMounted, ref } from 'vue'

	import { DiscountsIcon } from '@/shared/icons'
	import Banner from '@/shared/ui/Banner.vue'
	import DeleteModal from '@/shared/ui/DeleteModal.vue'
	import Pagination from '@/shared/ui/Pagination.vue'
	import TextField from '@/shared/ui/TextField.vue'

	import { discountsApi } from '../api/discounts'
	import DiscountCreateModal from '../components/DiscountCreateModal.vue'
	import DiscountsTable from '../components/DiscountsTable.vue'
	import type { Discount } from '../types/discount'

	const loading = ref(false)
	const discounts = ref<Discount[]>([])
	const showDiscountModal = ref(false)
	const selectedDiscount = ref<Discount | null>(null)
	const showDeleteModal = ref(false)
	const loadingDeleteModal = ref(false)
	const total = ref(0)
	const limit = ref(10)
	const offset = ref(0)
	const filters = ref({
		title: '',
		order: ''
	})

	const load = async () => {
		loading.value = true
		try {
			const result = await discountsApi.listDiscounts({
				title: filters.value.title,
				order: filters.value.order === '' ? undefined : Number(filters.value.order),
				limit: limit.value,
				offset: offset.value
			})
			discounts.value = result.items
			total.value = result.total
		} finally {
			loading.value = false
		}
	}

	onMounted(load)

	const openCreate = () => {
		selectedDiscount.value = null
		showDiscountModal.value = true
	}

	const closeDiscountModal = () => {
		showDiscountModal.value = false
		selectedDiscount.value = null
	}

	const editDiscount = (discount: Discount) => {
		selectedDiscount.value = discount
		showDiscountModal.value = true
	}

	const deleteDiscount = (discount: Discount) => {
		selectedDiscount.value = discount
		showDeleteModal.value = true
	}

	const confirmDelete = async () => {
		if (!selectedDiscount.value?.id) return

		loadingDeleteModal.value = true
		try {
			await discountsApi.deleteDiscount(selectedDiscount.value.id)
			showDeleteModal.value = false
			selectedDiscount.value = null
			await load()
		} finally {
			loadingDeleteModal.value = false
		}
	}

	const reorderDiscounts = async (orderedDiscounts: Discount[]) => {
		discounts.value = orderedDiscounts
		await discountsApi.reorderDiscounts({
			items: orderedDiscounts
				.filter((discount): discount is Discount & { id: number } => discount.id !== null)
				.map((discount) => ({
					id: discount.id,
					order: discount.order
				}))
		})
		await load()
	}

	const applyFilters = async () => {
		offset.value = 0
		await load()
	}

	const resetFilters = async () => {
		filters.value = {
			title: '',
			order: ''
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
		<Banner title="Скидки" subtitle="Список скидок и управление ими." :icon="DiscountsIcon">
			<template #actions>
				<button
					type="button"
					class="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
					@click="openCreate"
				>
					Добавить скидку
				</button>
			</template>
		</Banner>

		<form
			class="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-4 md:grid-cols-4"
			@submit.prevent="applyFilters"
		>
			<TextField v-model.trim="filters.title" label="Title" name="title" placeholder="Title" />
			<TextField v-model="filters.order" label="Order" name="order" type="number" min="0" />

			<div class="flex items-end gap-2">
				<button
					type="submit"
					class="h-12 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
				>
					Фильтр
				</button>
				<button
					type="button"
					class="h-12 rounded-xl px-4 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-200 hover:bg-gray-50"
					@click="resetFilters"
				>
					Сброс
				</button>
			</div>
		</form>

		<DiscountsTable
			:discounts="discounts"
			:loading="loading"
			@edit="editDiscount"
			@delete="deleteDiscount"
			@reorder="reorderDiscounts"
		/>

		<Pagination :total="total" :limit="limit" :offset="offset" @update:offset="changeOffset" />

		<DiscountCreateModal
			:open="showDiscountModal"
			:discount="selectedDiscount"
			@close="closeDiscountModal"
			@saved="load"
		/>

		<DeleteModal
			:open="showDeleteModal"
			:title="selectedDiscount?.title"
			entity-name="скидку"
			:loading="loadingDeleteModal"
			@close="showDeleteModal = false"
			@confirm="confirmDelete"
		/>
	</div>
</template>
