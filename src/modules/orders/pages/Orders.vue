<script setup lang="ts">
	import { onMounted, ref } from 'vue'
	import { useRouter } from 'vue-router'
	import { toast } from 'vue3-toastify'

	import Banner from '@/shared/ui/Banner.vue'
	import Button from '@/shared/ui/Button.vue'
	import DeleteModal from '@/shared/ui/DeleteModal.vue'
	import Pagination from '@/shared/ui/Pagination.vue'
	import SelectField from '@/shared/ui/SelectField.vue'
	import TextField from '@/shared/ui/TextField.vue'
	import OrdersTable from '../components/OrdersTable.vue'

	import { TableIcon } from '@/shared/icons'
	import { api } from '../api'
	import type { ExportOrdersParams } from '../api/orders'
	import {
		DELIVERY_STATUS_FILTER_OPTIONS,
		ORDER_STATUS_FILTER_OPTIONS,
		PAYMENT_STATUS_FILTER_OPTIONS
	} from '../helpers'
	import type { Order } from '../types'

	const router = useRouter()
	const loading = ref(false)
	const orders = ref<Order[]>([])
	const selectedOrders = ref<Order[]>([])
	const selectedOrder = ref<Order | null>(null)
	const showDeleteModal = ref(false)
	const loadingDeleteModal = ref(false)
	const total = ref(0)
	const limit = ref(15)
	const offset = ref(0)

	const filters = ref({
		date_from: '',
		date_to: '',
		email: '',
		order_status: null as string | null,
		payment_status: null as string | null,
		delivery_status: null as string | null,
		order_number: '',
		product_id: undefined as number | undefined
	})

	const load = async () => {
		loading.value = true
		try {
			const result = await api.listOrders({
				date_from: filters.value.date_from || undefined,
				date_to: filters.value.date_to || undefined,
				email: filters.value.email || undefined,
				order_status: filters.value.order_status ?? undefined,
				payment_status: filters.value.payment_status ?? undefined,
				delivery_status: filters.value.delivery_status ?? undefined,
				order_number: filters.value.order_number || undefined,
				product_id: filters.value.product_id ?? undefined,
				limit: limit.value,
				offset: offset.value
			})
			orders.value = result.items
			total.value = result.total
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
		filters.value = {
			date_from: '',
			date_to: '',
			email: '',
			order_status: null,
			payment_status: null,
			delivery_status: null,
			order_number: '',
			product_id: undefined
		}
		limit.value = 15
		offset.value = 0
		await load()
	}

	const changeOffset = async (value: number) => {
		offset.value = value
		await load()
	}

	const openOrder = (order: Order) => {
		if (!order.id) return
		router.push(`/admin-panel/orders/${order.id}`)
	}

	const buildExportParams = (): ExportOrdersParams => {
		const params: ExportOrdersParams = {
			date_from: filters.value.date_from || undefined,
			date_to: filters.value.date_to || undefined,
			email: filters.value.email || undefined,
			order_status: filters.value.order_status ?? undefined,
			payment_status: filters.value.payment_status ?? undefined,
			delivery_status: filters.value.delivery_status ?? undefined,
			order_number: filters.value.order_number || undefined,
			product_id: filters.value.product_id ?? undefined
		}
		if (selectedOrders.value.length) {
			params.ids = selectedOrders.value.map((o) => o.id!)
		}
		return params
	}

	const exportXml = async () => {
		try {
			await api.exportOrdersXml(buildExportParams())
			toast.success('XML файл скачан')
		} catch {
			toast.error('Не удалось экспортировать XML')
		}
	}

	const exportPdf = async () => {
		try {
			await api.exportOrdersPdf(buildExportParams())
			toast.success('PDF файл скачан')
		} catch {
			toast.error('Не удалось экспортировать PDF')
		}
	}

	const exportExcel = async () => {
		try {
			await api.exportOrdersExcel(buildExportParams())
			toast.success('Excel файл скачан')
		} catch {
			toast.error('Не удалось экспортировать Excel')
		}
	}

	const deleteOrder = (order: Order) => {
		selectedOrder.value = order
		showDeleteModal.value = true
	}

	const confirmDelete = async () => {
		if (!selectedOrder.value?.id) return

		loadingDeleteModal.value = true
		try {
			await api.deleteOrder(selectedOrder.value.id)
			showDeleteModal.value = false
			selectedOrder.value = null
			await load()
		} finally {
			loadingDeleteModal.value = false
		}
	}

	const bulkDelete = async () => {
		if (!selectedOrders.value.length) return
		if (!confirm(`Вы действительно хотите удалить ${selectedOrders.value.length} выбранных заказов?`)) return

		try {
			const ids = selectedOrders.value.map((o) => o.id!)
			await api.bulkDeleteOrders(ids)
			toast.success('Выбранные заказы удалены')
			selectedOrders.value = []
			await load()
		} catch {
			toast.error('Не удалось удалить выбранные заказы')
		}
	}
</script>

<template>
	<div class="space-y-6">
		<Banner title="Заказы" subtitle="Список заказов с фильтрами." :icon="TableIcon" :total="total">
			<template #actions>
				<div class="flex flex-wrap items-center gap-2">
					<Button
						v-if="selectedOrders.length"
						type="button"
						size="sm"
						v-bind:class-name="'bg-red-600 hover:bg-red-700 text-white'"
						:on-click="bulkDelete"
					>
						Удалить выбранные ({{ selectedOrders.length }})
					</Button>
					<Button type="button" size="sm" variant="outline" :on-click="exportExcel">Экспорт Excel</Button>
					<Button type="button" size="sm" variant="outline" :on-click="exportXml">Экспорт XML</Button>
					<Button type="button" size="sm" variant="outline" :on-click="exportPdf">Экспорт PDF</Button>
				</div>
			</template>
		</Banner>

		<form
			class="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-4 md:grid-cols-3 xl:grid-cols-4"
			@submit.prevent="applyFilters"
		>
			<TextField v-model="filters.date_from" label="Дата с" name="date_from" type="date" />
			<TextField v-model="filters.date_to" label="Дата по" name="date_to" type="date" />
			<TextField v-model.trim="filters.email" label="Email" name="email" placeholder="email@example.com" />
			<TextField v-model.trim="filters.order_number" label="Номер заказа" name="order_number" placeholder="ORD-..." />
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
				v-model="filters.delivery_status"
				label="Статус доставки"
				name="delivery_status"
				placeholder="Все"
				:options="DELIVERY_STATUS_FILTER_OPTIONS"
			/>
			<TextField
				v-model.number="filters.product_id"
				label="ID продукта"
				name="product_id"
				type="number"
				min="1"
				placeholder="1"
			/>

			<div class="flex items-end gap-2 md:col-span-3 xl:col-span-4">
				<Button type="submit" size="sm">Фильтр</Button>
				<Button type="button" variant="outline" size="sm" :on-click="resetFilters">Сброс</Button>
			</div>
		</form>

		<OrdersTable
			:orders="orders"
			v-model:selected-orders="selectedOrders"
			:loading="loading"
			:pagination="{ limit, offset }"
			@open="openOrder"
			@delete="deleteOrder"
		/>

		<Pagination :total="total" :limit="limit" :offset="offset" @update:offset="changeOffset" />

		<DeleteModal
			:open="showDeleteModal"
			:title="selectedOrder?.order_number"
			entity-name="заказ"
			:loading="loadingDeleteModal"
			@close="showDeleteModal = false"
			@confirm="confirmDelete"
		/>
	</div>
</template>
