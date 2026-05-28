export * from './order-detail'
export * from './order-display'
export * from './order-statuses'

export const ORDERS_TABLE_COLUMNS = [
	{ key: 'id', label: 'ID' },
	{ key: 'order_status', label: 'Статус заказа' },
	{ key: 'payment_status', label: 'Статус оплаты' },
	{ key: 'delivery_status', label: 'Статус доставки' },
	{ key: 'customer', label: 'Покупатель' },
	{ key: 'created_at', label: 'Дата' },
	{ key: 'total', label: 'Сумма' },
	{ key: 'actions', label: 'Редактировать', headerClass: 'text-right' }
]

export const CARTS_TABLE_COLUMNS = [
	{ key: 'id', label: 'ID' },
	{ key: 'user', label: 'Пользователь' },
	{ key: 'canvas', label: 'Товары' },
	{ key: 'price', label: 'Цена' },
	{ key: 'items_count', label: 'Количество товаров' },
	{ key: 'updated_at', label: 'Дата обновления' }
]
