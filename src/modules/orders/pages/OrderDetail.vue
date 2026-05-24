<script setup lang="ts">
	import { computed, defineAsyncComponent, onMounted, ref, watch } from 'vue'
	import { useRoute, useRouter } from 'vue-router'

	import Button from '@/shared/ui/Button.vue'
	import OrderDetailTabBar from '../components/order-detail/OrderDetailTabBar.vue'
	import OrderEditForm from '../components/order-detail/OrderEditForm.vue'
	import OrderInfoTab from '../components/order-detail/OrderInfoTab.vue'
	const OrderProductsTab = defineAsyncComponent(() => import('../components/order-detail/OrderProductsTab.vue'))

	import { api } from '../api'
	import type { OrderDetailTab } from '../helpers'
	import type { Order, OrderItem } from '../types'

	const route = useRoute()
	const router = useRouter()

	const loading = ref(false)
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

	const loadOrder = async () => {
		if (!orderId.value) return

		loading.value = true
		try {
			order.value = await api.getOrder(orderId.value)
		} finally {
			loading.value = false
		}
	}

	const onOrderSaved = (updated: Order) => {
		order.value = updated
	}

	const onItemUpdated = (updatedItem: OrderItem) => {
		if (!order.value?.items) return

		const index = order.value.items.findIndex((item) => item.id === updatedItem.id)
		if (index === -1) return

		order.value.items = order.value.items.map((item) => (item.id === updatedItem.id ? updatedItem : item))
	}

	onMounted(loadOrder)

	watch(orderId, loadOrder)
</script>

<template>
	<div class="space-y-6">
		<div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
			<div class="flex flex-wrap items-start justify-between gap-4">
				<div>
					<h3 class="text-lg font-semibold text-gray-900">{{ pageTitle }}</h3>
				</div>

				<Button type="button" variant="outline" size="sm" :on-click="() => router.push('/admin-panel/orders')">
					Назад к списку
				</Button>
			</div>

			<p v-if="loading" class="mt-6 text-sm text-gray-600">Загрузка заказа...</p>
			<p v-else-if="!order" class="mt-6 text-sm text-gray-600">Заказ не найден.</p>

			<div v-else class="mt-6 space-y-6">
				<OrderDetailTabBar v-model:active-tab="activeTab" />
				<OrderEditForm
					v-show="activeTab === 'orderInfo'"
					v-if="isTabMounted('orderInfo')"
					:order="order"
					@saved="onOrderSaved"
				/>

				<OrderInfoTab v-show="activeTab === 'orderInfo'" v-if="isTabMounted('orderInfo')" :order="order" />

				<OrderProductsTab
					v-show="activeTab === 'products'"
					v-if="isTabMounted('products') && orderId"
					:order-id="orderId"
					:items="order.items ?? []"
					@item-updated="onItemUpdated"
				/>
			</div>
		</div>
	</div>
</template>
