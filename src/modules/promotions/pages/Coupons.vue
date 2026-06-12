<script setup lang="ts">
	import { computed, defineAsyncComponent, onMounted, ref } from 'vue'
	import { toast } from 'vue3-toastify'

	import Banner from '@/shared/ui/Banner.vue'
	import Button from '@/shared/ui/Button.vue'
	import DeleteModal from '@/shared/ui/DeleteModal.vue'
	import CouponsTable from '../components/CouponsTable.vue'

	const CouponCreateModal = defineAsyncComponent(() => import('../components/CouponCreateModal.vue'))

	import { CouponsIcon } from '@/shared/icons'
	import { api } from '../api'
	import type { Coupon } from '../types'

	const loading = ref(false)
	const coupons = ref<Coupon[]>([])
	const showModal = ref(false)
	const selectedCoupon = ref<Coupon | null>(null)
	const showDeleteModal = ref(false)
	const loadingDeleteModal = ref(false)

	const total = computed(() => coupons.value.length)

	const load = async () => {
		loading.value = true
		try {
			coupons.value = await api.listCoupons()
		} finally {
			loading.value = false
		}
	}

	onMounted(load)

	const openCreate = () => {
		selectedCoupon.value = null
		showModal.value = true
	}

	const closeModal = () => {
		showModal.value = false
		selectedCoupon.value = null
	}

	const editCoupon = (coupon: Coupon) => {
		selectedCoupon.value = coupon
		showModal.value = true
	}

	const deleteCoupon = (coupon: Coupon) => {
		selectedCoupon.value = coupon
		showDeleteModal.value = true
	}

	const confirmDelete = async () => {
		if (!selectedCoupon.value?.id) return

		loadingDeleteModal.value = true
		try {
			await api.deleteCoupon(selectedCoupon.value.id)
			showDeleteModal.value = false
			selectedCoupon.value = null
			toast.success('Купон удалён')
			await load()
		} catch {
			toast.error('Не удалось удалить купон')
		} finally {
			loadingDeleteModal.value = false
		}
	}
</script>

<template>
	<div class="space-y-6">
		<Banner title="Купоны" subtitle="Список купонов и управление ими." :icon="CouponsIcon" :total="total">
			<template #actions>
				<Button type="button" size="sm" :on-click="openCreate">Добавить купон</Button>
			</template>
		</Banner>

		<CouponsTable :coupons="coupons" :loading="loading" @edit="editCoupon" @delete="deleteCoupon" />

		<CouponCreateModal
			v-if="showModal"
			:open="showModal"
			:coupon="selectedCoupon"
			@close="closeModal"
			@saved="load"
		/>

		<DeleteModal
			:open="showDeleteModal"
			:title="selectedCoupon?.code"
			entity-name="купон"
			:loading="loadingDeleteModal"
			@close="showDeleteModal = false"
			@confirm="confirmDelete"
		/>
	</div>
</template>
