<script setup lang="ts">
	import { onMounted, ref } from 'vue'
	import { useRouter } from 'vue-router'
	import { toast } from 'vue3-toastify'

	import Banner from '@/shared/ui/Banner.vue'
	import Button from '@/shared/ui/Button.vue'
	import DeleteModal from '@/shared/ui/DeleteModal.vue'
	import Pagination from '@/shared/ui/Pagination.vue'
	import DeliveryDatesTable from '../components/delivery-times/DeliveryDatesTable.vue'

	import { getFirstBackendValidationMessage } from '@/shared/api/validation'
	import { ClockIcon } from '@/shared/icons'
	import { api } from '../api'
	import type { DeliveryDate } from '../types'

	const router = useRouter()

	const loading = ref(false)
	const items = ref<DeliveryDate[]>([])
	const selectedItem = ref<DeliveryDate | null>(null)
	const showDeleteModal = ref(false)
	const loadingDeleteModal = ref(false)
	const total = ref(0)
	const limit = ref(10)
	const offset = ref(0)

	const load = async () => {
		loading.value = true
		try {
			const result = await api.listDeliveryDates({ limit: limit.value, offset: offset.value })
			items.value = result.items
			total.value = result.total
		} finally {
			loading.value = false
		}
	}

	onMounted(load)

	const openCreate = () => {
		router.push('/admin-panel/configuration/delivery-times/create')
	}

	const editItem = (item: DeliveryDate) => {
		if (!item.id) return
		router.push(`/admin-panel/configuration/delivery-times/${item.id}/edit`)
	}

	const deleteItem = (item: DeliveryDate) => {
		selectedItem.value = item
		showDeleteModal.value = true
	}

	const confirmDelete = async () => {
		if (!selectedItem.value?.id) return

		loadingDeleteModal.value = true
		try {
			await api.deleteDeliveryDate(selectedItem.value.id)
			toast.success('Срок доставки удалён')
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
			title="Сроки доставки"
			subtitle="Список сроков доставки и управление ими."
			:icon="ClockIcon"
			:total="total"
		>
			<template #actions>
				<Button type="button" size="sm" :on-click="openCreate">Добавить срок</Button>
			</template>
		</Banner>

		<DeliveryDatesTable :items="items" :loading="loading" @edit="editItem" @delete="deleteItem" />

		<Pagination :total="total" :limit="limit" :offset="offset" @update:offset="changeOffset" />

		<DeleteModal
			:open="showDeleteModal"
			:title="selectedItem?.name"
			entity-name="срок доставки"
			:loading="loadingDeleteModal"
			@close="showDeleteModal = false"
			@confirm="confirmDelete"
		/>
	</div>
</template>
