<script setup lang="ts">
	import { computed } from 'vue'

	import OrderInfoFields from './OrderInfoFields.vue'

	import { displayValue, formatMoney, formatOrderDate } from '../../helpers'
	import type { Order } from '../../types'

	const props = defineProps<{
		order: Order
	}>()

	const customerName = computed(
		() =>
			[props.order.first_name, props.order.last_name].filter(Boolean).join(' ').trim() || props.order.user?.name || '—'
	)

	const mainFields = computed(() => [
		{ label: 'ID', value: displayValue(props.order.id) },
		{ label: 'Номер заказа', value: displayValue(props.order.order_number) },
		{ label: 'Создан', value: formatOrderDate(props.order.created_at) },
		{ label: 'Обновлён', value: props.order.updated_at ? formatOrderDate(props.order.updated_at) : '—' },
		{ label: 'IP-адрес', value: displayValue(props.order.ip_address) },
		{ label: 'Session ID', value: displayValue(props.order.session_id) }
	])

	const totalsFields = computed(() => [
		{ label: 'Подытог', value: formatMoney(props.order.subtotal ?? '') },
		{ label: 'Налог', value: formatMoney(props.order.tax ?? '') },
		{ label: 'Доставка', value: formatMoney(props.order.shipping_cost ?? '') },
		{ label: 'Скидка', value: formatMoney(props.order.discount_amount ?? '') },
		{ label: 'Купон', value: displayValue(props.order.coupon_code) },
		{ label: 'Итого', value: formatMoney(props.order.total) },
		{ label: 'Прибыль', value: formatMoney(props.order.profit ?? '') }
	])

	const customerFields = computed(() => [
		{ label: 'Имя', value: customerName.value },
		{ label: 'Email', value: displayValue(props.order.email) },
		{ label: 'Телефон', value: displayValue(props.order.phone) },
		{ label: 'Компания', value: displayValue(props.order.company) },
		{ label: 'User ID', value: displayValue(props.order.user_id) },
		{ label: 'Пользователь (аккаунт)', value: displayValue(props.order.user?.name) },
		{ label: 'Email аккаунта', value: displayValue(props.order.user?.email) },
		{ label: 'Заметка клиента', value: displayValue(props.order.customer_note) }
	])

	const paymentFields = computed(() => [{ label: 'Способ оплаты', value: displayValue(props.order.payment_method) }])
</script>

<template>
	<div class="space-y-8">
		<OrderInfoFields title="Основное" :fields="mainFields" />
		<OrderInfoFields title="Суммы" :fields="totalsFields" />
		<OrderInfoFields title="Клиент" :fields="customerFields" />
		<OrderInfoFields title="Оплата" :fields="paymentFields" />
	</div>
</template>
