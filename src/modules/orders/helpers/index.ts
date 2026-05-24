export * from './order-detail'
export * from './order-display'
export * from './order-statuses'

export const ORDERS_TABLE_COLUMNS = [
	{ key: 'order_number', label: 'Номер' },
	{ key: 'customer', label: 'Клиент' },
	{ key: 'email', label: 'Email' },
	{ key: 'phone', label: 'Телефон' },
	{ key: 'total', label: 'Сумма' },
	{ key: 'order_status', label: 'Заказ' },
	{ key: 'payment_status', label: 'Оплата' },
	{ key: 'delivery_status', label: 'Доставка' },
	{ key: 'items_count', label: 'Позиций' },
	{ key: 'created_at', label: 'Создан' }
]
