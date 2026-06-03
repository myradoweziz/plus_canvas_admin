<script setup lang="ts">
	import { onMounted, ref } from 'vue'
	import { useRouter } from 'vue-router'
	import { toast } from 'vue3-toastify'

	import Banner from '@/shared/ui/Banner.vue'
	import Button from '@/shared/ui/Button.vue'
	import DeleteModal from '@/shared/ui/DeleteModal.vue'
	import Pagination from '@/shared/ui/Pagination.vue'
	import PaymentMethodsTable from '../components/payment-methods/PaymentMethodsTable.vue'

	import { getFirstBackendValidationMessage } from '@/shared/api/validation'
	import { CreditCardIcon } from '@/shared/icons'
	import { api } from '../api'
	import type { PaymentMethod } from '../types'

	const router = useRouter()

	const loading = ref(false)
	const items = ref<PaymentMethod[]>([])
	const selectedItem = ref<PaymentMethod | null>(null)
	const showDeleteModal = ref(false)
	const loadingDeleteModal = ref(false)
	const total = ref(0)
	const limit = ref(10)
	const offset = ref(0)

	const load = async () => {
		loading.value = true
		try {
			const result = await api.listPaymentMethods({ limit: limit.value, offset: offset.value })
			items.value = result.items
			total.value = result.total
		} finally {
			loading.value = false
		}
	}

	onMounted(load)

	const openCreate = () => {
		router.push('/admin-panel/configuration/payment-methods/create')
	}

	const editItem = (item: PaymentMethod) => {
		if (!item.id) return
		router.push(`/admin-panel/configuration/payment-methods/${item.id}/edit`)
	}

	const deleteItem = (item: PaymentMethod) => {
		selectedItem.value = item
		showDeleteModal.value = true
	}

	const confirmDelete = async () => {
		if (!selectedItem.value?.id) return

		loadingDeleteModal.value = true
		try {
			await api.deletePaymentMethod(selectedItem.value.id)
			toast.success('Способ оплаты удалён')
			showDeleteModal.value = false
			selectedItem.value = null
			await load()
		} catch (err) {
			const msg = getFirstBackendValidationMessage(err)
			if (msg) toast.error(msg)
			else throw err
		} finally {
			loadingDeleteModal.value = false
		}
	}

	const changeOffset = async (value: number) => {
		offset.value = value
		await load()
	}
</script>

<template>
	<div class="space-y-6">
		<Banner
			title="Способы оплаты"
			subtitle="Список способов оплаты и управление ими."
			:icon="CreditCardIcon"
			:total="total"
		>
			<template #actions>
				<Button type="button" size="sm" :on-click="openCreate">Добавить способ оплаты</Button>
			</template>
		</Banner>

		<PaymentMethodsTable :items="items" :loading="loading" @edit="editItem" @delete="deleteItem" />

		<Pagination :total="total" :limit="limit" :offset="offset" @update:offset="changeOffset" />

		<DeleteModal
			:open="showDeleteModal"
			:title="selectedItem?.friendly_name"
			entity-name="способ оплаты"
			:loading="loadingDeleteModal"
			@close="showDeleteModal = false"
			@confirm="confirmDelete"
		/>
	</div>
</template>
