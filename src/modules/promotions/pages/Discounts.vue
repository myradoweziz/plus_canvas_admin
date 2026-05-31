<script setup lang="ts">
	import { computed, defineAsyncComponent, onMounted, ref } from 'vue'
	import { toast } from 'vue3-toastify'

	import Banner from '@/shared/ui/Banner.vue'
	import Button from '@/shared/ui/Button.vue'
	import DeleteModal from '@/shared/ui/DeleteModal.vue'
	import DiscountsTable from '../components/DiscountsTable.vue'

	const DiscountCreateModal = defineAsyncComponent(() => import('../components/DiscountCreateModal.vue'))

	import { DiscountTypesIcon } from '@/shared/icons'
	import { api } from '../api'
	import type { Discount } from '../types'

	const loading = ref(false)
	const discounts = ref<Discount[]>([])
	const showModal = ref(false)
	const selectedDiscount = ref<Discount | null>(null)
	const showDeleteModal = ref(false)
	const loadingDeleteModal = ref(false)

	const total = computed(() => discounts.value.length)

	const load = async () => {
		loading.value = true
		try {
			discounts.value = await api.listDiscounts()
		} finally {
			loading.value = false
		}
	}

	onMounted(load)

	const openCreate = () => {
		selectedDiscount.value = null
		showModal.value = true
	}

	const closeModal = () => {
		showModal.value = false
		selectedDiscount.value = null
	}

	const editDiscount = (discount: Discount) => {
		selectedDiscount.value = discount
		showModal.value = true
	}

	const deleteDiscount = (discount: Discount) => {
		selectedDiscount.value = discount
		showDeleteModal.value = true
	}

	const confirmDelete = async () => {
		if (!selectedDiscount.value?.id) return

		loadingDeleteModal.value = true
		try {
			await api.deleteDiscount(selectedDiscount.value.id)
			showDeleteModal.value = false
			selectedDiscount.value = null
			toast.success('Скидка удалена')
			await load()
		} catch {
			toast.error('Не удалось удалить скидку')
		} finally {
			loadingDeleteModal.value = false
		}
	}
</script>

<template>
	<div class="space-y-6">
		<Banner title="Скидки" subtitle="Список скидок и управление ими." :icon="DiscountTypesIcon" :total="total">
			<template #actions>
				<Button type="button" size="sm" :on-click="openCreate">Добавить скидку</Button>
			</template>
		</Banner>

		<DiscountsTable :discounts="discounts" :loading="loading" @edit="editDiscount" @delete="deleteDiscount" />

		<DiscountCreateModal
			v-if="showModal"
			:open="showModal"
			:discount="selectedDiscount"
			@close="closeModal"
			@saved="load"
		/>

		<DeleteModal
			:open="showDeleteModal"
			:title="selectedDiscount?.name"
			entity-name="скидку"
			:loading="loadingDeleteModal"
			@close="showDeleteModal = false"
			@confirm="confirmDelete"
		/>
	</div>
</template>
