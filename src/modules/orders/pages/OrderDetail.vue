<script setup lang="ts">
	import { computed, defineAsyncComponent, onMounted, ref, watch } from 'vue'
	import { useRoute, useRouter } from 'vue-router'
	import { toast } from 'vue3-toastify'

	import Button from '@/shared/ui/Button.vue'
	import DeleteModal from '@/shared/ui/DeleteModal.vue'
	import OrderDetailTabBar from '../components/order-detail/OrderDetailTabBar.vue'
	import OrderEditForm from '../components/order-detail/OrderEditForm.vue'
	import OrderInfoTab from '../components/order-detail/OrderInfoTab.vue'
	const OrderProductsTab = defineAsyncComponent(() => import('../components/order-detail/OrderProductsTab.vue'))
	const OrderBillingTab = defineAsyncComponent(() => import('../components/order-detail/OrderBillingTab.vue'))
	const OrderShippingTab = defineAsyncComponent(() => import('../components/order-detail/OrderShippingTab.vue'))
	const OrderNotesTab = defineAsyncComponent(() => import('../components/order-detail/OrderNotesTab.vue'))

	import { getErrorMessage } from '@/shared/api/errors'
	import { api } from '../api'
	import type { OrderDetailTab } from '../helpers'
	import type { Order, OrderNote } from '../types'

	const route = useRoute()
	const router = useRouter()

	const loading = ref(false)
	const deleting = ref(false)
	const showDeleteModal = ref(false)
	const order = ref<Order | null>(null)
	const activeTab = ref<OrderDetailTab>('orderInfo')
	const mountedTabs = ref<Set<OrderDetailTab>>(new Set(['orderInfo']))

	const orderId = computed(() => {
		const id = Number(route.params.id)
		return Number.isFinite(id) ? id : null
	})

	const pageTitle = computed(() => order.value?.order_number ?? `Заказ #${orderId.value ?? ''}`)

	const isTabMounted = (tab: OrderDetailTab) => mountedTabs.value.has(tab)

	watch(activeTab, (tab) => {
		mountedTabs.value = new Set([...mountedTabs.value, tab])
	})

	const loadOrder = async (options?: { silent?: boolean }) => {
		if (!orderId.value) return

		if (!options?.silent) loading.value = true

		try {
			order.value = await api.getOrder(orderId.value)
		} finally {
			if (!options?.silent) loading.value = false
		}
	}

	const onOrderSaved = (updated: Order) => {
		order.value = updated
	}

	const reloadProducts = () => loadOrder({ silent: true })

	const onNoteCreated = (note: OrderNote) => {
		if (!order.value) return
		order.value.notes = [...(order.value.notes ?? []), note]
	}

	const onNoteDeleted = (noteId: number) => {
		if (!order.value) return
		order.value.notes = (order.value.notes ?? []).filter((note) => note.id !== noteId)
	}

	const confirmDeleteOrder = async () => {
		if (!orderId.value) return

		deleting.value = true

		try {
			await api.deleteOrder(orderId.value)
			toast.success('Заказ удалён')
			showDeleteModal.value = false
			await router.push('/admin-panel/orders')
		} catch (error) {
			toast.error(getErrorMessage(error, 'Не удалось удалить заказ'))
		} finally {
			deleting.value = false
		}
	}

	onMounted(loadOrder)

	watch(orderId, () => loadOrder())
</script>

<template>
	<div v-if="orderId" class="space-y-6">
		<div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
			<div class="flex flex-wrap items-start justify-between gap-4">
				<div>
					<h3 class="text-lg font-semibold text-gray-900">{{ pageTitle }}</h3>
				</div>

				<div class="flex flex-wrap items-center gap-2">
					<Button
						v-if="order"
						type="button"
						size="sm"
						class="bg-red-600 text-white hover:bg-red-700"
						:disabled="deleting"
						:on-click="() => (showDeleteModal = true)"
					>
						Удалить заказ
					</Button>
					<Button type="button" variant="outline" size="sm" :on-click="() => router.push('/admin-panel/orders')">
						Назад к списку
					</Button>
				</div>
			</div>

			<p v-if="loading" class="mt-6 text-sm text-gray-600">Загрузка заказа...</p>
			<p v-else-if="!order" class="mt-6 text-sm text-gray-600">Заказ не найден.</p>

			<div v-else class="mt-6 space-y-6">
				<OrderDetailTabBar v-model:active-tab="activeTab" />

				<div v-show="activeTab === 'orderInfo'" class="space-y-6">
					<OrderEditForm :order="order" @saved="onOrderSaved" />
					<OrderInfoTab :order="order" />
				</div>

				<div v-show="activeTab === 'billing'">
					<OrderBillingTab v-if="isTabMounted('billing')" :order="order" @saved="onOrderSaved" />
				</div>

				<div v-show="activeTab === 'shipping'">
					<OrderShippingTab v-if="isTabMounted('shipping')" :order="order" @saved="onOrderSaved" />
				</div>

				<div v-show="activeTab === 'products'">
					<OrderProductsTab
						v-if="isTabMounted('products')"
						:order-id="orderId"
						:items="order.items ?? []"
						@refresh="reloadProducts"
					/>
				</div>

				<div v-show="activeTab === 'notes'">
					<OrderNotesTab
						v-if="isTabMounted('notes')"
						:order-id="orderId"
						:notes="order.notes ?? []"
						@note-created="onNoteCreated"
						@note-deleted="onNoteDeleted"
					/>
				</div>
			</div>
		</div>

		<DeleteModal
			:open="showDeleteModal"
			:title="order?.order_number"
			entity-name="заказ"
			:loading="deleting"
			@close="showDeleteModal = false"
			@confirm="confirmDeleteOrder"
		/>
	</div>
</template>
