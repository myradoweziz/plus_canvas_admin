<script setup lang="ts">
	import { onMounted, ref } from 'vue'

	import { DiscountsIcon } from '@/shared/icons'
	import Banner from '@/shared/ui/Banner.vue'
	import DeleteModal from '@/shared/ui/DeleteModal.vue'

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

	const load = async () => {
		loading.value = true
		try {
			discounts.value = await discountsApi.listDiscounts()
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
			orders: orderedDiscounts
				.filter((discount): discount is Discount & { id: number } => discount.id !== null)
				.map((discount) => ({
					id: discount.id,
					order: discount.order
				}))
		})
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

		<DiscountsTable
			:discounts="discounts"
			:loading="loading"
			@edit="editDiscount"
			@delete="deleteDiscount"
			@reorder="reorderDiscounts"
		/>

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

