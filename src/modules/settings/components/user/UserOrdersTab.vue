<script setup lang="ts">
	import { onMounted, ref, watch } from 'vue'
	import { useRouter } from 'vue-router'
	import { toast } from 'vue3-toastify'

	import UserOrdersTable from './UserOrdersTable.vue'

	import type { Order } from '@/modules/orders/types'
	import { api } from '../../api'

	const props = defineProps<{ userId: number }>()

	const router = useRouter()
	const loading = ref(false)
	const orders = ref<Order[]>([])

	const loadOrders = async () => {
		loading.value = true
		try {
			orders.value = await api.getUserOrders(props.userId)
		} catch {
			orders.value = []
			toast.error('Не удалось загрузить заказы')
		} finally {
			loading.value = false
		}
	}

	const openOrder = (order: Order) => {
		router.push(`/admin-panel/orders/${order.id}`)
	}

	onMounted(loadOrders)

	watch(
		() => props.userId,
		() => loadOrders()
	)
</script>

<template>
	<UserOrdersTable :orders="orders" :loading="loading" @open="openOrder" />
</template>
